/**
 * @constructor
 * @param {Number} coefficient
 */
function NValue(coefficient) {
    this.coefficient = coefficient;
}

/**
 * @return {string}
 */
NValue.prototype.toString = function toString() {
    var coef = this.coefficient;
    if (coef.asNumber) {
        coef = coef.asNumber();
    }
    if (coef === 1) {
        return 'n';
    } else if (!coef) {
        return '0';
    } else {
        return coef.toString() + 'n';
    }
};

/**
 * @return {string}
 */
NValue.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {NValue}
 */
NValue.prototype.optimize = function optimize() {
    return this;
};

module.exports = NValue;
