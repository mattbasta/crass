/**
 * @constructor
 * @param {*} base
 * @param {string} operator
 * @param {Expression} term
 */
function MathSum(base, operator, term) {
    this.base = base;
    this.operator = operator;
    this.term = term;
}

/**
 * @return {string}
 */
MathSum.prototype.toString = function toString() {
    var output = '';
    var base = this.base.toString();
    var term = this.term.toString();
    output += base;
    output += ' ';
    output += this.operator;
    output += ' ';
    output += term;
    return output;
};

/**
 * @return {string}
 */
MathSum.prototype.pretty = function pretty() {
    var output = '';
    var base = this.base.pretty();
    var term = this.term.pretty();
    output += base;
    output += ' ';
    output += this.operator;
    output += ' ';
    output += term;
    return output;
};

/**
 * @param {object} kw
 * @return {MathSum}
 */
MathSum.prototype.optimize = function optimize(kw) {
    this.base = this.base.optimize(kw);
    this.term = this.term.optimize(kw);
    return this;
};

module.exports = MathSum;
