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
 * @param {object} kw
 * @return {IDSelector}
 */
IDSelector.prototype.optimize = function optimize(kw) {
    if (!kw.saveid && this.ident.indexOf('#')) {
        return null;
    }
    return this;
};

module.exports = IDSelector;
