var colorConvert = require('color-convert');

var colorOptimizer = require('../optimizations/color');
var Dimension = require('./Dimension');
var Expression = require('./Expression');
var objects = require('../objects');
var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} name
 * @param {Expressino} content
 */
function Func(name, content) {
    this.name = name;
    this.content = content;
}

/**
 * @return {string}
 */
Func.prototype.toString = function toString() {
    if (this.content) {
        return this.name + '(' + this.content.toString() + ')';
    } else {
        return this.name + '()';
    }
};

/**
 * @param {int} indent
 * @return {string}
 */
Func.prototype.pretty = function pretty(indent) {
    if (this.content) {
       return this.name + '(' + this.content.pretty(indent) + ')';
    } else {
	   return this.name + '()';
    }
};


/**
 * @param {object} kw
 * @return {Func}
 */
Func.prototype.optimize = function optimize(kw) {
    // OPT: Lowercase function names.
    this.name = this.name.toLowerCase();
    var oldkwf = kw.func;
    kw.func = this.name;
    if (this.content) {
        this.content = optimization.try_(this.content, kw);
    } else if (this.name.indexOf('linear-gradient') !== -1) {
        return null;
    }

    if (
        this.name === 'calc' &&
        !(
            this.content instanceof objects.MathSum ||
            this.content instanceof objects.MathProduct
        )
    ) {
        return this.content;
    }

    var self = this.optimizeColor(kw);
    if (!self || !(self instanceof Func)) {
        kw.func = oldkwf;
        return self;
    }

    self = self.optimizeLinearGradient(kw);
    if (!self || !self.content) {
        kw.func = oldkwf;
        return null;
    }

    self = self.optimizeRadialGradient(kw);
    if (!self || !self.content) {
        kw.func = oldkwf;
        return null;
    }

    if (this.name === 'calc') {
        self = self.optimizeCalc(kw);
    }


    kw.func = oldkwf;

    return self;
};

var ALPHA_INDEX = {
    'gray': 1,
    'rgba': 3,
    'hsla': 3,
    'hwb': 3,
};

/**
 * @param {object} kw
 * @return {Func}
 */
Func.prototype.optimizeColor = function optimizeColor(kw) {
    if (
        !this.content ||
        !this.content.chain ||
        !this.content.chain.every(function(x, i) {
            if (ALPHA_INDEX[this.name] && i === ALPHA_INDEX[this.name]) {
                return utils.isNum(x[1]);
            }
            if (
                (
                    i === 0 && (this.name === 'hsl' || this.name === 'hsla' || this.name === 'hwb') ||
                    i === 2 && this.name === 'hwb'
                ) &&
                x[1] instanceof Dimension
            ) {
                return true;
            }
            return utils.isPositiveNum(x[1]) || (x[1].unit && x[1].unit === '%' && utils.isPositiveNum(x[1].number));
        }, this)
    ) {
        return this;
    }

    // OPT: Convert color functions to shortest variants
    var chainLength = this.content.chain.length;
    switch(this.name) {
        case 'rgb':
        case 'hsl':
            if (chainLength !== 3) return this;
            break;
        case 'rgba':
        case 'hsla':
            if (chainLength !== 4) return this;
            break;
        case 'gray':
            if (chainLength < 1 || chainLength > 2) return this;
            break;
        case 'hwb':
        case 'lab':
        case 'lch':
            if (chainLength < 3 || chainLength > 4) return this;
            break;
        default:
            return this;
    }

    var applier;
    var alpha = 1;

    var components = this.content.chain.map(function(v) {
        return asRealNum(v[1]);
    });

    switch (this.name) {
        case 'rgba':
        case 'hsla':
            alpha = components[3];
            applier = function(funcName) {
                var name = this.name.substr(0, 3);
                if (funcName === name) {
                    return components.slice(0, 3);
                }
                return colorConvert[name][funcName](components[0], components[1], components[2]);
            }.bind(this);
            break;
        case 'rgb':
        case 'hsl':
            applier = function(funcName) {
                if (funcName === this.name) {
                    return components.slice(0, 3);
                }
                return colorConvert[this.name][funcName](components[0], components[1], components[2]);
            }.bind(this);
            break;
        case 'gray':
            if (components.length > 1) {
                alpha = components[1];
            }
            applier = function(funcName) {
                return colorConvert.gray[funcName](components[0]);
            };
            break;
        case 'hwb':
        case 'lab':
        case 'lch':
            if (components.length > 3) {
                alpha = components[3];
            }
            applier = function(funcName) {
                if (funcName === this.name) {
                    return components.slice(0, 3);
                }
                return colorConvert[this.name][funcName](components[0], components[1], components[2]);
            }.bind(this);
            break;
        default:
            return this;
    }

    return colorOptimizer(applier, alpha, kw);
};



var GRADIENT_ANGLES = {
    top: function() {
        return new objects.Number(0);
    },
    right: function() {
        return new Dimension(
            new objects.Number(90),
            'deg'
        );
    },
    bottom: function() {
        return new Dimension(
            new objects.Number(180),
            'deg'
        );
    },
    left: function() {
        return new Dimension(
            new objects.Number(270),
            'deg'
        );
    },
};

/**
 * @param {object} kw
 * @return {Func}
 */
Func.prototype.optimizeLinearGradient = function optimizeLinearGradient(kw) {
    if (
        !(
            this.name === 'linear-gradient' ||
            this.name === 'repeating-linear-gradient' ||
            this.name === '-webkit-linear-gradient' ||
            this.name === '-webkit-repeating-linear-gradient'
        ) ||
        !this.content ||
        !this.content.chain
    ) {
        return this;
    }

    var chain = this.content.chain;
    var numSeparators = chain.reduce((acc, x) => acc + (x[0] !== null ? 1 : 0), 0);

    if (
        chain.length > 2 &&
        chain[2][0] !== null &&
        chain[0][1] === 'to' &&
        chain[1][1] in GRADIENT_ANGLES
    ) {
        const val = chain[1][1];
        chain = chain.slice(1);
        chain[0] = [null, GRADIENT_ANGLES[val]()];
    }

    var segments = chain.reduce((acc, cur) => {
        if (cur[0] !== null) {
            acc.push([]);
        }
        acc[acc.length - 1].push(cur);
        return acc;
    }, [[]]);
    var lastStop = null;
    segments.forEach((group, idx) => {
        if (group.length !== 2 || !(group[1][1] instanceof Dimension || group[1][1] instanceof objects.Number)) {
            return;
        }
        var isFinal = idx === segments.length - 1;
        if (!lastStop) {
            lastStop = group[1][1];
            if (isFinal) {
                return;
            }
            if (lastStop instanceof Dimension && (lastStop.asNumber() !== 0 || lastStop.unit !== '%')) {
                return;
            }
            if (lastStop instanceof objects.Number && lastStop.asNumber() !== 0) {
                return;
            }
            group[1][1] = null;
            return;
        }

        // TODO: This should consider the units and transform to px if possible
        if (lastStop.unit === group[1][1].unit && lastStop.asNumber() >= group[1][1].asNumber()) {
            group[1][1] = new objects.Number(0);
        }
        lastStop = group[1][1];
        if (isFinal && group[1][1].unit === '%' && group[1][1].asNumber() === 100) {
            group[1][1] = null;
        }
    });

    chain = chain.filter(x => x[1]);
    this.content = (new Expression(chain)).optimize(kw);
    return this;
};

/**
 * @param {object} kw
 * @return {Func}
 */
Func.prototype.optimizeRadialGradient = function optimizeRadialGradient(kw) {
    if (
        this.name !== 'radial-gradient' &&
        this.name !== 'repeating-radial-gradient' &&
        this.name !== '-webkit-radial-gradient' &&
        this.name !== '-webkit-repeating-radial-gradient' ||
        !this.content ||
        !this.content.chain ||
        !this.content.chain.length
    ) {
        return this;
    }

    var chain = this.content.chain;
    var segments = chain.reduce((acc, cur) => {
        if (cur[0] !== null) {
            acc.push([]);
        }
        acc[acc.length - 1].push(cur);
        return acc;
    }, [[]]);
    var lastStop = null;
    segments.forEach((group, idx) => {
        if (group.length !== 2 || !(group[1][1] instanceof Dimension || group[1][1] instanceof objects.Number)) {
            return;
        }
        var isFinal = idx === segments.length - 1;
        if (!lastStop) {
            lastStop = group[1][1];
            if (isFinal) {
                return;
            }
            if (lastStop instanceof Dimension && (lastStop.asNumber() !== 0 || lastStop.unit !== '%')) {
                return;
            }
            if (lastStop instanceof objects.Number && lastStop.asNumber() !== 0) {
                return;
            }
            group[1][1] = null;
            return;
        }

        // TODO: This should consider the units and transform to px if possible
        if (lastStop.unit === group[1][1].unit && lastStop.asNumber() >= group[1][1].asNumber()) {
            group[1][1] = new objects.Number(0);
        }
        lastStop = group[1][1];
        if (isFinal && group[1][1].unit === '%' && group[1][1].asNumber() === 100) {
            group[1][1] = null;
        }
    });

    this.content = (new Expression(chain)).optimize(kw);
    return this;
};

/**
 * @param {object} kw
 * @return {Func}
 */
Func.prototype.optimizeCalc = function optimizeCalc(kw) {
    this.content = this.content.optimize(kw);
    if (!this.content) {
        return null;
    }
    return this;
};



/**
 * Converts Number to JS number
 * @param  {Number} num
 * @return {number}
 */
function asRealNum(num) {
    if (num.unit && num.unit === '%') num = num.number;
    if (num.unit && num.unit === 'deg') return num.number.asNumber() % 360 / 360 * 255;
    if (num.unit && num.unit === 'grad') return num.number.asNumber() % 400 / 400 * 255;
    if (num.unit && num.unit === 'rad') return num.number.asNumber() % (2 * Math.PI) / (2 * Math.PI) * 255;
    if (num.unit && num.unit === 'turn') return num.number.asNumber() % 1 * 255;
    return num.asNumber();
}

module.exports = Func;
