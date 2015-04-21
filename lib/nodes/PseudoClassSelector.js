/**
 * @constructor
 * @param {string} ident
 */
function PseudoClassSelector(ident) {
    this.ident = ident;
}

/**
 * @return {string}
 */
PseudoClassSelector.prototype.toString = function toString() {
    return ':' + this.ident;
};

/**
 * @return {string}
 */
PseudoClassSelector.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {PseudoClassSelector}
 */
PseudoClassSelector.prototype.optimize = function optimize() {
    // OPT: Lowercase pseudo element names.
    this.ident = this.ident.toLowerCase();
    return this;
};

module.exports = PseudoClassSelector;
