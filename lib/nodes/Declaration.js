var browserSupport = require('../browser_support');
var optimization = require('../optimization');


/**
 * @constructor
 * @param {string} ident
 * @param {Expression} expr
 */
function Declaration(ident, expr) {
    this.ident = ident;
    this.expr = expr;
    this.important = false;
    this.slashNine = false;
    this.slashZero = false;
}

/**
 * @return {string}
 */
Declaration.prototype.toString = function toString() {
    return this.ident + ':' + this.expr.toString() +
        (this.important ? '!important' : '') +
        (this.slashZero ? '\\0' : '') +
        (this.slashNine ? '\\9' : '');
};

/**
 * @param {int} indent
 * @return {string}
 */
Declaration.prototype.pretty = function pretty(indent) {
    return this.ident + ': ' + this.expr.pretty(indent) +
        (this.important ? ' !important' : '') +
        (this.slashZero ? ' \\0' : '') +
        (this.slashNine ? ' \\9' : '');
};

/**
 * @param {object} kw
 * @return {Declaration}
 */
Declaration.prototype.optimize = function optimize(kw) {
    // OPT: Lowercase descriptor names.
    this.ident = this.ident.toLowerCase();

    // OPT: Ignore * declarations from old IE
    if (!kw.saveie && this.ident[0] === '*') {
        return null;
    }

    // OPT: Ignore slash nine from old IE
    if (!kw.saveie && this.slashNine) {
        return null;
    }

    // OPT: Ignore slash zero from old IE
    if (!kw.saveie && this.slashZero) {
        return null;
    }

    // OPT: Remove unsupported declarations.
    if (!browserSupport.supportsDeclaration(this.ident, kw)) {
        return null;
    }

    // OPT: Remove unsupported flexbox properties
    if (
        kw.browser_min && kw.browser_min.ie && kw.browser_min.ie > 10 &&
        this.ident === 'display' &&
        this.expr &&
        (this.expr.toString() === '-ms-flexbox' || this.expr.toString() === '-ms-inline-flexbox')
    ) {
        return null;
    }

    kw.declarationName = this.ident.toLowerCase();
    this.expr = optimization.try_(this.expr, kw);
    if (!this.expr) {
        return null;
    }
    delete kw.declarationName;

    // OPT: Remove mismatched vendor prefixes in declarations.
    if (kw.vendorPrefix && this.ident.match(/\-[a-z]+\-.+/)) {
        if (this.ident.substr(0, kw.vendorPrefix.length) !== kw.vendorPrefix) {
            return null;
        }
    }

    return this;
};

module.exports = Declaration;
