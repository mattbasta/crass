var optimization = require('../optimization');


/**
 * @constructor
 * @param {string} descriptor
 * @param {Expression} value
 */
function MediaExpression(descriptor, value) {
    this.descriptor = descriptor;
    this.value = value;
}

/**
 * @return {string}
 */
MediaExpression.prototype.toString = function toString() {
    if (this.value) {
        return '(' + this.descriptor.toString() + ':' + this.value.toString() + ')';
    } else {
        return '(' + this.descriptor.toString() + ')';
    }
};

/**
 * @return {string}
 */
MediaExpression.prototype.pretty = function pretty(indent) {
    if (this.value) {
        return '(' + this.descriptor.toString() + ': ' + this.value.pretty(indent) + ')';
    } else {
        return '(' + this.descriptor.toString() + ')';
    }
};

/**
 * @param {object} kw
 * @return {MediaExpression}
 */
MediaExpression.prototype.optimize = function optimize(kw) {
    this.value = optimization.try_(this.value, kw);
    return this;
};

module.exports = MediaExpression;
