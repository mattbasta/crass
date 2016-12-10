var optimization = require('../optimization');


/**
 * @constructor
 * @param {Number} number
 * @param {string} unit
 */
function Dimension(number, unit) {
    this.number = number;
    this.unit = unit || '';
}

/**
 * Return just the numeric portion of the dimension, as a JS number
 * @return {number}
 */
Dimension.prototype.asNumber = function asNumber() {
    return this.number.asNumber();
};

/**
 * @return {string}
 */
Dimension.prototype.toString = function toString() {
    if (Math.abs(this.number.value) === 0 && this.unit !== '%') {
        return '0';
    } else {
        return this.number.toString() + this.unit;
    }
};

/**
 * @param {int} indent
 * @return {string}
 */
Dimension.prototype.pretty = function pretty(indent) {
    return this.number.pretty(indent) + this.unit;
};

/**
 * @param {object} kw
 * @return {Dimension}
 */
Dimension.prototype.optimize = function optimize(kw) {
    if (!this.unit) {
        return this.number;
    }
    if (
        kw.func !== 'hsl' &&
        kw.func !== 'hsla' &&
        Math.abs(this.number.value) === 0 &&
        kw.declarationName !== 'height'
    ) {
        return this.number;
    }
    return optimization.unit(this, kw);
};

module.exports = Dimension;
