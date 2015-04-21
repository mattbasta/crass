var objects = require('../objects');

/**
 * @constructor
 * @param {*} base
 * @param {string} operator
 * @param {Expression} term
 */
function MathProduct(base, operator, term) {
    this.base = base;
    this.operator = operator;
    this.term = term;
}

/**
 * @return {string}
 */
MathProduct.prototype.toString = function toString() {
    var output = '';
    var base = this.base.toString();
    var term = this.term.toString();
    output += this.base instanceof objects.MathSum ? '(' + base + ')' : base;
    output += this.operator;
    output += this.term instanceof objects.MathSum ? '(' + term + ')' : term;
    return output;
};

/**
 * @return {string}
 */
MathProduct.prototype.pretty = function pretty() {
    var output = '';
    var base = this.base.pretty();
    var term = this.term.pretty();
    output += this.base instanceof objects.MathSum ? '(' + base + ')' : base;
    output += ' ';
    output += this.operator;
    output += ' ';
    output += this.term instanceof objects.MathSum ? '(' + term + ')' : term;
    return output;
};

/**
 * @param {object} kw
 * @return {MathProduct}
 */
MathProduct.prototype.optimize = function optimize(kw) {
    this.base = this.base.optimize(kw);
    this.term = this.term.optimize(kw);
    return this;
};

module.exports = MathProduct;
