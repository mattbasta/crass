/**
 * @constructor
 * @param {string} value
 */
function String(value) {
    this.value = value.toString().replace(/\\(['"])/g, '$1');

    this._noQuotes = false;
}

/**
 * @param {bool} raw Whether to output the raw string
 * @return {string}
 */
String.prototype.asString = function asString(raw) {
    if (raw && this.value.indexOf('\\') === -1) {
        return this.value;
    }
    return this.toString();
};

/**
 * @return {string}
 */
String.prototype.toString = function toString() {
    if (this._noQuotes) {
        return this.value;
    }
    var single_ = "'" + this.value.replace(/'/g, "\\'") + "'";
    var double_ = '"' + this.value.replace(/"/g, '\\"') + '"';
    // OPT: Choose the shortest string variation
    return (single_.length < double_.length) ? single_ : double_;
};

/**
 * @return {string}
 */
String.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {String}
 */
String.prototype.optimize = function optimize(kw) {
    if (kw.declarationName === 'font-family' && /[\w ]/.exec(this.value)) {
        this._noQuotes = true;
    }
    return this;
};

module.exports = String;
