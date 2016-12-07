var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {array} content
 * @param {string} vendorPrefix
 */
function Viewport(content, vendorPrefix) {
    this.content = content;
    this.vendorPrefix = vendorPrefix;
}

/**
 * @return {string}
 */
Viewport.prototype.getBlockHeader = function getBlockHeader() {
    return this.vendorPrefix ? '@' + this.vendorPrefix + 'viewport' : '@viewport';
};

/**
 * @return {string}
 */
Viewport.prototype.toString = function toString() {
    var output = this.getBlockHeader();
    output += '{';
    output += utils.joinAll(this.content, ';');
    output += '}';
    return output;
};

/**
 * @param {int} indent
 * @return {string}
 */
Viewport.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent(this.getBlockHeader() + ' {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1), indent);
    }).join(';\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {Viewport}
 */
Viewport.prototype.optimize = function optimize(kw) {
    var oldPrefix;
    if (this.vendorPrefix) {
        oldPrefix = kw.vendorPrefix;
        kw.vendorPrefix = this.vendorPrefix;
    }

    this.content = optimization.optimizeDeclarations(this.content, kw);
    kw.vendorPrefix = oldPrefix;

    if (!this.content.length) return null;

    return this;
};


module.exports = Viewport;
