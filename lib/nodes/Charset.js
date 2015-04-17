/**
 * @constructor
 * @param {string} charset Charset for the stylesheet
 */
function Charset(charset) {
    this.charset = charset;
}

/**
 * @return {string}
 */
Charset.prototype.toString = function toString() {
    return '@charset ' + this.charset.toString() + ';';
};

/**
 * @return {string}
 */
Charset.prototype.pretty = function pretty() {
    return this.toString() + '\n';
};

/**
 * @return {Charset}
 */
Charset.prototype.optimize = function optimize() {
    return this;
};

module.exports = Charset;
