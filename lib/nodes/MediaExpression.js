var optimization = require('../optimization');


/**
 * @constructor
 * @param {string} descriptor
 * @param {Expression} value
 * @param {object} ieCrap Flags for IE
 */
function MediaExpression(descriptor, value, ieCrap) {
    this.descriptor = descriptor;
    this.value = value;
    this.ieCrap = ieCrap;
}

/**
 * @return {string}
 */
MediaExpression.prototype.toString = function toString() {
    var descriptor = this.descriptor.toString();
    var slashZero = this.ieCrap.slashZero ? '\\0' : '';
    if (this.value) {
        return '(' + descriptor + ':' + this.value.toString() + slashZero + ')';
    } else {
        return '(' + descriptor + slashZero + ')';
    }
};

/**
 * @return {string}
 */
MediaExpression.prototype.pretty = function pretty(indent) {
    var descriptor = this.descriptor.toString();
    var slashZero = this.ieCrap.slashZero ? '\\0' : '';
    if (this.value) {
        return '(' + descriptor + ': ' + this.value.pretty(indent) + slashZero + ')';
    } else {
        return '(' + descriptor + slashZero + ')';
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
