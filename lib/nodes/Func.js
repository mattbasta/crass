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

    // OPT: Convert color functions to shortest variants.
    if (this.content &&
        this.content.chain &&
        this.content.chain.every(function(x) {
            return utils.isPositiveNum(x[1]) || (x[1].unit && x[1].unit === '%' && utils.isPositiveNum(x[1].number));
        })) {

        switch(this.name) {
            case 'rgb':
            case 'hsl':
                if (this.content.chain.length !== 3) return this;
                break;
            case 'rgba':
            case 'hsla':
                if (this.content.chain.length !== 4) return this;
                break;
            default:
                return this;
        }


        var converter = colorConvert();
        var converter_func = converter[this.name.substr(0, 3)];

        var components = this.content.chain.slice(0, 3).map(function(v) {
            return asRealNum(v[1]);
        });
        return optimization.color(
            converter_func.apply(converter, components),
            this.content.chain[3] !== undefined ? asRealNum(this.content.chain[3][1]) : 1
        );
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
