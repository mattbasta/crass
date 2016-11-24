'use strict';

const path = require('path');

const objects = require('../objects');

/**
 * @constructor
 * @param {string} uri
 */
function URI(uri) {
    uri = uri.trim();
    if (uri[0] === uri[uri.length - 1] && (uri[0] === '"' || uri[0] === "'") || uri.indexOf(')') !== -1) {
        uri = new objects.String(uri.substring(1, uri.length - 1));
    }
    this.uri = uri;
}

/**
 * @return {string}
 */
URI.prototype.asString = function asString() {
    if (this.uri instanceof objects.String) {
        return this.uri;
    }
    return new objects.String(this.uri);
};

/**
 * @return {string}
 */
URI.prototype.toString = function toString() {
    let uri = this.uri;
    if (typeof uri === 'string' && uri.indexOf(')') !== -1) {
        uri = new objects.String(uri);
    } else if (typeof uri === 'string') {
        return `url(${uri})`;
    }
    return 'url(' + uri.asString(uri.asString(true).indexOf(')') === -1) + ')';
};

/**
 * @return {string}
 */
URI.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @return {URI}
 */
URI.prototype.optimize = function optimize(kw) {
    // OPT: Normalize URIs
    if (kw.o1) {
        if (this.uri instanceof objects.String) {
            this.uri = new objects.String(
                path.normalize(this.uri.asString(true))
            );
        } else {
            this.uri = path.normalize(this.uri);
        }
    }
    if (this.uri instanceof objects.String) {
        this.uri = this.uri.optimize(kw);
        if (!this.uri) {
            return null;
        }
    }
    return this;
};

module.exports = URI;
