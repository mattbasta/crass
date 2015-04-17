/**
 * @constructor
 * @param {string} ident
 */
function PseudoElementSelector(ident) {
    this.ident = ident;
}

/**
 * @return {string}
 */
PseudoElementSelector.prototype.toString = function toString() {
    return '::' + this.ident;
};

/**
 * @return {string}
 */
PseudoElementSelector.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {PseudoElementSelector}
 */
PseudoElementSelector.prototype.optimize = function optimize() {
    // OPT: Lowercase pseudo element names.
    this.ident = this.ident.toLowerCase();
    return this;
};

module.exports = PseudoElementSelector;
