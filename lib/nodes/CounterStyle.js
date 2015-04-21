var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} name
 * @param {array} content
 */
function CounterStyle(name, content) {
    this.name = name;
    this.content = content;
}

/**
 * @return {string}
 */
CounterStyle.prototype.toString = function toString() {
    var output = '@counter-style ' + this.name;
    output += '{';
    output += utils.joinAll(this.content, ';');
    output += '}';
    return output;
};

/**
 * @param {int} indent
 * @return {string}
 */
CounterStyle.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent('@counter-style ' + this.name + ' {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1), indent);
    }).join(';\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {CounterStyle}
 */
CounterStyle.prototype.optimize = function optimize(kw) {
    this.content = optimization.optimizeDeclarations(this.content, kw);
    if (!this.content.length) return null;
    return this;
};


module.exports = CounterStyle;
