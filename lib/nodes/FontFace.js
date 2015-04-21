var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {*} content
 */
function FontFace(content) {
    this.content = content;
}

/**
 * @return {string}
 */
FontFace.prototype.toString = function toString() {
    return '@font-face{' + utils.joinAll(this.content, ';') + '}';
};

/**
 * @param {int} indent
 * @return {string}
 */
FontFace.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent('@font-face {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {FontFace}
 */
FontFace.prototype.optimize = function optimize(kw) {
    this.content = optimization.optimizeDeclarations(this.content, kw);
    if (!this.content.length) {
        return null;
    }
    return this;
};


module.exports = FontFace;
