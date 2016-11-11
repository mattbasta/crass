var colorConvert = require('color-convert');

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

    // OPT: Convert color functions to shortest variants
    if (this.content &&
        this.content.chain &&
        this.content.chain.every(function(x, i) {
            if (i === this.content.chain.length - 1) {
                return utils.isNum(x[1]);
            }
            return utils.isPositiveNum(x[1]) || (x[1].unit && x[1].unit === '%' && utils.isPositiveNum(x[1].number));
        }, this)) {

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
        }

        return optimization.color(applier, alpha, kw);
    }

    kw.func = oldkwf;

    return this;
};


/**
 * Converts Number to JS number
 * @param  {Number} num
 * @return {number}
 */
function asRealNum(num) {
    if (num.unit && num.unit === '%') num = num.number;
    return num.asNumber();
}

module.exports = Func;
