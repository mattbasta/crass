var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} margin
 * @param {array} content
 */
function PageMargin(margin, content) {
    this.margin = margin;
    this.content = content;
}


/**
 * @return {string}
 */
PageMargin.prototype.toString = function toString() {
    return '@' + this.margin + '{' + utils.joinAll(this.content) + '}';
};

/**
 * @return {string}
 */
PageMargin.prototype.pretty = function pretty() {
    var output = '';
    output += utils.indent('@' + this.margin + ' {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {PageMargin}
 */
PageMargin.prototype.optimize = function optimize(kw) {
    this.content = optimization.optimizeDeclarations(this.content, kw);
    return this;
};


module.exports = PageMargin;
