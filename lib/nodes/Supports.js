var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {SupportsConditionList} conditionList
 * @param {*} blocks
 */
function Supports(conditionList, blocks) {
    this.conditionList = conditionList;
    this.blocks = blocks;
}

/**
 * @return {string}
 */
Supports.prototype.toString = function toString() {
    var output = '@supports ';
    output += this.conditionList.toString();
    output += '{' + utils.joinAll(this.blocks) + '}';
    return output;
};

/**
 * @return {string}
 */
Supports.prototype.pretty = function pretty(indent) {
    var conditionList = this.conditionList.pretty(indent);
    var output = utils.indent(
        '@supports ' + conditionList + ' {',
        indent
    ) + '\n';
    output += this.blocks.map(function(line) {
        return utils.indent(line.pretty(indent + 1), indent);
    }).join('\n');
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {Supports}
 */
Supports.prototype.optimize = function optimize(kw) {
    this.conditionList = this.conditionList.optimize(kw);
    this.blocks = optimization.optimizeBlocks(this.blocks, kw);
    return this;
};

module.exports = Supports;
