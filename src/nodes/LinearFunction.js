var optimization = require('../optimization');


/**
 * @constructor
 * @param {NValue} nValue
 * @param {Number} offset
 */
function LinearFunction(nValue, offset) {
    this.nValue = nValue;
    this.offset = offset;
}

/**
 * @return {string}
 */
LinearFunction.prototype.toString = function toString() {
    if (this.nValue) {
        var operator = this.offset.value < 0 ? '-' : '+';
        return this.nValue.toString() + operator + this.offset.asUnsigned().toString();
    } else {
        return this.offset.toString();
    }
};

/**
 * @return {string}
 */
LinearFunction.prototype.pretty = function pretty() {
    if (this.nValue) {
        var operator = this.offset.value < 0 ? ' - ' : ' + ';
        return this.nValue.toString() + operator + this.offset.asUnsigned().toString();
    } else {
        return this.offset.toString();
    }
};

/**
 * @param {object} kw
 * @return {LinearFunction}
 */
LinearFunction.prototype.optimize = function optimize(kw) {
    this.nValue = optimization.try_(this.nValue, kw);
    return this;
};

module.exports = LinearFunction;
