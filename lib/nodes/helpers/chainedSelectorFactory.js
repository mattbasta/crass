var optimization = require('../../optimization');


module.exports = function chainedSelectorFactory(name, operator) {
    // I know, I'm sorry. Call me when ES6 allows Function.prototype.name to be configured.
    var constructor = eval(
        '(function ' + name + '(ancestor, descendant) {\n' +
        '    this.ancestor = ancestor;\n' +
        '    this.descendant = descendant;\n' +
        '})'
    );

    constructor.prototype = {};

    constructor.prototype.operator = operator;

    /**
     * @return {string}
     */
    constructor.prototype.toString = function toString() {
        return this.ancestor.toString() + this.operator + this.descendant.toString();
    };

    /**
     * @param {int} indent
     * @return {string}
     */
    constructor.prototype.pretty = function pretty(indent) {
        var paddedType = this.operator === ' ' ? ' ' : (' ' + this.operator + ' ');
        return this.ancestor.pretty(indent) + paddedType + this.descendant.pretty(indent);
    };

    /**
     * @param  {object} kw
     * @return {*}
     */
    constructor.prototype.optimize = function optimize(kw) {
        this.ancestor = optimization.try_(this.ancestor, kw);
        this.descendant = optimization.try_(this.descendant, kw);
        return this;
    };

    return constructor;

};
