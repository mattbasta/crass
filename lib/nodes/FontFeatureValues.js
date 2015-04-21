var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} fontName
 * @param {*} content
 */
function FontFeatureValues(fontName, content) {
    this.fontName = fontName;
    this.content = content;
}

/**
 * @return {string}
 */
FontFeatureValues.prototype.toString = function toString() {
    return '@font-feature-values ' + this.fontName + '{' + utils.joinAll(this.content) + '}';
};

/**
 * @param {int} indent
 * @return {string}
 */
FontFeatureValues.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent('@font-feature-values ' + this.fontName + ' {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1), indent + 1);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {FontFeatureValues}
 */
FontFeatureValues.prototype.optimize = function optimize(kw) {
    this.content = optimization.optimizeBlocks(this.content, kw);
    if (!this.content.length) {
        return null;
    }
    return this;
};


module.exports = FontFeatureValues;
