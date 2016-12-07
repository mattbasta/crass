var optimization = require('../optimization');

/**
 * @constructor
 * @param {SelectorList} selector
 */
function NotSelector(selector) {
    this.selector = selector;
}

/**
 * @return {string}
 */
NotSelector.prototype.toString = function toString() {
    return ':not(' + this.selector.toString() + ')';
};

/**
 * @param {int} indent
 * @return {string}
 */
NotSelector.prototype.pretty = function pretty(indent) {
    return ':not(' + this.selector.pretty(indent) + ')';
};

/**
 * @param {object} kw
 * @return {NotSelector}
 */
NotSelector.prototype.optimize = function optimize(kw) {
    this.selector = optimization.try_(this.selector, kw);
    return this;
};

module.exports = NotSelector;
