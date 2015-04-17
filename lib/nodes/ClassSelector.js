/**
 * @constructor
 * @param {string} ident
 */
function ClassSelector(ident) {
    this.ident = ident;
}

/**
 * @return {string}
 */
ClassSelector.prototype.toString = function toString() {
    return '.' + this.ident;
};

/**
 * @return {string}
 */
ClassSelector.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {ClassSelector}
 */
ClassSelector.prototype.optimize = function optimize() {
    return this;
};

module.exports = ClassSelector;
