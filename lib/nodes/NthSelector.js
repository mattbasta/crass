var objects = require('../objects');
var optimization = require('../optimization');

/**
 * @constructor
 * @param {string} funcName
 * @param {LinearFunction} linearFunc
 */
function NthSelector(funcName, linearFunc) {
    this.funcName = funcName;
    this.linearFunc = linearFunc;
}

/**
 * @return {string}
 */
NthSelector.prototype.toString = function toString() {
    return ':' + this.funcName + '(' + this.linearFunc.toString() + ')';
};

/**
 * @param {int} indent
 * @return {string}
 */
NthSelector.prototype.pretty = function pretty(indent) {
    var lf_pretty = this.linearFunc.pretty ? this.linearFunc.pretty(indent) : this.linearFunc.toString();
    return ':' + this.funcName + '(' + lf_pretty + ')';
};

/**
 * @param {object} kw
 * @return {NthSelector}
 */
NthSelector.prototype.optimize = function optimize(kw) {
    this.linearFunc = optimization.try_(this.linearFunc, kw);

    // OPT: nth-selectors (2n+1) to (odd)
    if (this.linearFunc.toString() === '2n+1') {
        return new objects.NthSelector(this.funcName, 'odd');
    }

    return this;
};

module.exports = NthSelector;
