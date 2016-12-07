var optimization = require('../optimization');


/**
 * @constructor
 * @param {string} funcName
 * @param {Expression} expr
 */
function PseudoSelectorFunction(funcName, expr) {
    this.funcName = funcName;
    this.expr = expr;
}

/**
 * @return {string}
 */
PseudoSelectorFunction.prototype.toString = function toString() {
    return ':' + this.funcName + '(' + this.expr.toString() + ')';
};

/**
 * @param {int} ident
 * @return {string}
 */
PseudoSelectorFunction.prototype.pretty = function pretty(indent) {
    return ':' + this.funcName + '(' + this.expr.pretty(indent) + ')';
};

/**
 * @param {object} kw
 * @return {PseudoSelectorFunction}
 */
PseudoSelectorFunction.prototype.optimize = function optimize(kw) {
    // OPT: Lowercase pseudo function names.
    this.funcName = this.funcName.toLowerCase();
    this.expr = optimization.try_(this.expr, kw);
    return this;
};

module.exports = PseudoSelectorFunction;
