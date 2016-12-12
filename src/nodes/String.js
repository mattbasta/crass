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
    if (raw) {
        return this.value.replace(/(\s)/g, '\\$1');
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
    const single_ = "'" + this.value.replace(/'/g, "\\'") + "'";
    const double_ = '"' + this.value.replace(/"/g, '\\"') + '"';
    // OPT: Choose the shortest string variation
    return (single_.length < double_.length) ? single_ : double_;
};

/**
 * @return {string}
 */
String.prototype.pretty = function pretty() {
    return this.toString();
};

const keywords = [
    'cursive',
    'fantasy',
    'monospace',
    'sans-serif',
    'serif',
];

/**
 * @return {String}
 */
String.prototype.optimize = function optimize(kw) {
    if (
        kw.declarationName === 'font-family' && /[\w ]/.exec(this.value) &&
        keywords.every(keyword => this.value.toLowerCase().indexOf(keyword) === -1)
    ) {
        const newValue = this.value.replace(/ (?=\d+\b)/g, '\\ ');
        if (newValue.length <= this.value.length + 2) {
            this._noQuotes = true;
            this.value = newValue;
        }
    }
    return this;
};

module.exports = String;
