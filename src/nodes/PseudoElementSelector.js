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
    if (this.ident === 'before' || this.ident === 'after') {
        return ':' + this.ident;
    }
    return '::' + this.ident;
};

/**
 * @return {string}
 */
PseudoElementSelector.prototype.pretty = function pretty() {
    return '::' + this.ident;
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
