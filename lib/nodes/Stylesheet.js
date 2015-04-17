var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {Charset} charset
 * @param {Import[]} imports
 * @param {Namespace[]} namespaces
 * @param {*} content
 */
function Stylesheet(charset, imports, namespaces, content) {
    this.charset = charset;
    this.imports = imports;
    this.namespaces = namespaces;
    this.content = content;
}

/**
 * @return {string}
 */
Stylesheet.prototype.toString = function toString() {
    var output = '';
    if (this.charset) {
        output += this.charset.toString();
    }
    if (this.imports.length) {
        output += utils.joinAll(this.imports);
    }
    if (this.namespaces.length) {
        output += utils.joinAll(this.namespaces);
    }
    if (this.content.length) {
        output += utils.joinAll(this.content);
    }
    return output;
};

/**
 * @return {string}
 */
Stylesheet.prototype.pretty = function pretty(indent) {
    indent = indent || 0;
    var output = '';
    if (this.charset) {
        output += this.charset.pretty(indent);
    }
    if (this.imports.length) {
        output += utils.joinAll(this.imports, null, utils.prettyMap(indent));
    }
    if (this.namespaces.length) {
        output += utils.joinAll(this.namespaces, null, utils.prettyMap(indent));
    }
    if (this.content.length) {
        output += utils.joinAll(this.content, null, utils.prettyMap(indent));
    }
    return output;
};

/**
 * @return {Stylesheet}
 */
Stylesheet.prototype.optimize = function optimize(kw) {
    kw = kw || {};
    if (this.charset) {
        this.charset = optimization.try_(this.charset, kw);
    }
    if (this.imports.length) {
        this.imports = optimization.optimizeList(this.imports, kw);
    }
    if (this.namespaces.length) {
        this.namespaces = optimization.optimizeList(this.namespaces, kw);
    }
    this.content = optimization.optimizeBlocks(this.content, kw);
    return this;
};

module.exports = Stylesheet;
