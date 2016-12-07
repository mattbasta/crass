var objects = require('../objects');
var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} name
 * @param {*} content
 */
function Page(name, content) {
    this.name = name;
    this.content = content;
}

/**
 * @return {string}
 */
Page.prototype.toString = function toString() {
    var base = '@page';
    if (this.name) {
        base += ' ' + this.name;
    }
    return base + '{' + this.content.map(function(content, i) {
        var output = content.toString();
        if (content instanceof objects.Declaration && i !== this.content.length - 1) {
            output += ';'
        }
        return output;
    }, this).join('') + '}';
};

/**
 * @param {int} indent
 * @return {string}
 */
Page.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent('@page ' + (this.name ? this.name + ' ' : '') + '{') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {Page}
 */
Page.prototype.optimize = function optimize(kw) {
    this.content = optimization.optimizeBlocks(this.content, kw);
    return this;
};


module.exports = Page;
