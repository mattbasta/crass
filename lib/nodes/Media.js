var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {MediaQuery[]} media
 * @param {*} content
 */
function Media(media, content) {
    this.media = media;
    this.content = content;
}

/**
 * @return {string}
 */
Media.prototype.toString = function toString() {
    return '@media ' + utils.joinAll(this.media, ',') + '{' + utils.joinAll(this.content) + '}';
};

/**
 * @return {string}
 */
Media.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent('@media ' + utils.joinAll(this.media, ', ', utils.prettyMap(indent)) + ' {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1), indent);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @return {Media}
 */
Media.prototype.optimize = function optimize(kw) {
    this.media = optimization.optimizeList(this.media, kw);

    // OPT: Remove duplicate media queries.
    this.media = utils.uniq(null, this.media);

    this.content = optimization.optimizeBlocks(this.content, kw);

    return this;
};

module.exports = Media;
