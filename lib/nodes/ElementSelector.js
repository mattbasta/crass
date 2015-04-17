/**
 * @constructor
 * @param {string} ident
 * @param {string} ns
 */
function ElementSelector(ident, ns) {
    this.ident = ident;
    this.ns = ns;
}

/**
 * @return {string}
 */
ElementSelector.prototype.toString = function toString() {
    if (this.ident && this.ns) {
        return this.ident + '|' + this.ns;
    } else if (this.ns) {
        return '|' + this.ns;
    } else {
        return this.ident;
    }
};

/**
 * @return {string}
 */
ElementSelector.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {ElementSelector}
 */
ElementSelector.prototype.optimize = function optimize() {
    // OPT: Lowercase element names.
    this.ident = this.ident.toLowerCase();
    if (this.ns) {
        this.ns = this.ns.toLowerCase();
    }
    return this;
};

module.exports = ElementSelector;
