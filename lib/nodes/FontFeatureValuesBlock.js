var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} blockName
 * @param {*} content
 */
function FontFeatureValuesBlock(blockName, content) {
    this.blockName = blockName;
    this.content = content;
}

/**
 * @return {string}
 */
FontFeatureValuesBlock.prototype.toString = function toString() {
    return this.blockName + '{' + utils.joinAll(this.content, ';') + '}';
};

/**
 * @param {int} indent
 * @return {string}
 */
FontFeatureValuesBlock.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent(this.blockName + ' {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {FontFeatureValuesBlock}
 */
FontFeatureValuesBlock.prototype.optimize = function optimize(kw) {
    this.content = optimization.optimizeDeclarations(this.content, kw);
    return this;
};


module.exports = FontFeatureValuesBlock;
