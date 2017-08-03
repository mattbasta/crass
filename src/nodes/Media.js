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
Media.prototype.mediaQueriesToString = function mediaQueriesToString() {
    return utils.joinAll(this.media, ',');
};

/**
 * @return {string}
 */
Media.prototype.toString = function toString() {
    const queryString = this.mediaQueriesToString();
    return `@media${queryString[0] === '(' ? '' : ' '}${queryString}{${utils.joinAll(this.content)}}`;
};

/**
 * @return {string}
 */
Media.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent('@media ' + utils.joinAll(this.media, ', ', utils.prettyMap(indent)) + ' {') + '\n';
    output += this.content.map(line => utils.indent(line.pretty(indent + 1), indent)).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {Media}
 */
Media.prototype.optimize = function optimize(kw) {
    this.media = optimization.optimizeList(this.media, kw);

    // OPT: Remove duplicate media queries.
    this.media = utils.uniq(null, this.media);

    if (!this.media.length) {
        return null;
    }

    return this.optimizeContent(kw);
};

/**
 * @param {object} kw
 * @return {Media}
 */
Media.prototype.optimizeContent = function optimizeContent(kw) {
    this.content = optimization.optimizeBlocks(this.content, kw);
    if (!this.content.length) {
        return null;
    }

    return this;
};

module.exports = Media;
