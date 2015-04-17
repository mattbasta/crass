/**
 * @constructor
 * @param {string} ident
 */
function IDSelector(ident) {
    this.ident = ident;
}

/**
 * @return {string}
 */
IDSelector.prototype.toString = function toString() {
    return '#' + this.ident;
};

/**
 * @return {string}
 */
IDSelector.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {IDSelector}
 */
IDSelector.prototype.optimize = function optimize() {
    return this;
};

module.exports = IDSelector;
