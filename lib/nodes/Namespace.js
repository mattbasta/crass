/**
 * @constructor
 * @param {URL} namespaceURI
 * @param {string} prefix
 */
function Namespace(namespaceURI, prefix) {
    this.namespaceURI = namespaceURI;
    this.prefix = prefix;
}

/**
 * @return {string}
 */
Namespace.prototype.toString = function toString() {
    if (this.prefix) {
        return '@namespace ' + this.prefix + ' ' + this.namespaceURI.toString() + ';';
    } else {
        return '@namespace ' + this.namespaceURI.toString() + ';';
    }
};

/**
 * @return {string}
 */
Namespace.prototype.pretty = function pretty() {
    return this.toString() + '\n';
};

/**
 * @return {Namespace}
 */
Namespace.prototype.optimize = function optimize() {
    return this;
};

module.exports = Namespace;
