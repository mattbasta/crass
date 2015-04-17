/**
 * @constructor
 * @param {URL} href
 * @param {MediaList} media
 */
function Import(href, media) {
    this.href = href;
    this.media = media;
}

/**
 * @return {string}
 */
Import.prototype.toString = function toString() {
    if (this.media) {
        return '@import ' + this.href.asString() + ' ' + this.media.toString() + ';';
    } else {
        return '@import ' + this.href.asString() + ';';
    }
};

/**
 * @return {string}
 */
Import.prototype.pretty = function pretty() {
    return this.toString() + '\n';
};

/**
 * @return {Import}
 */
Import.prototype.optimize = function optimize() {
    return this;
};

module.exports = Import;
