/**
 * @constructor
 * @param {string[]} color
 */
function CustomIdent(idents) {
    this.idents = idents;
}


/**
 * @return {string}
 */
CustomIdent.prototype.toString = function toString() {
    return '[' + this.idents.join(' ') + ']';
};

/**
 * @return {string}
 */
CustomIdent.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {CustomIdent}
 */
CustomIdent.prototype.optimize = function optimize() {
    return this;
};

module.exports = CustomIdent;
