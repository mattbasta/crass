'use strict';

const path = require('path');

const sdu = require('strong-data-uri');
const svgo = require('svgo');

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
URI.prototype.asRawString = function asRawString() {
    if (this.uri instanceof objects.String) {
        return this.uri.value;
    }
    return this.uri;
};

/**
 * @return {string}
 */
URI.prototype.toString = function toString() {
    let uri = this.uri;
    if (typeof uri === 'string' && uri.indexOf(')') !== -1) {
        uri = new objects.String(uri);
    } else if (typeof uri === 'string') {
        return `url(${uri.replace(/\s/g, '\\ ')})`;
    }
    const rawStr = uri.asString(true);
    return 'url(' + uri.asString(rawStr.indexOf(')') === -1) + ')';
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
    let self = this;
    const isURL = this.isURL();

    // OPT: Normalize URIs
    if (kw.o1 && isURL) {
        const rawURI = this.asRawString();
        const urlCut = /https?:\/\/.+?(\/.*)/.exec(rawURI);
        if (urlCut) {
            const urlPath = urlCut[1];
            const optimizedPath = path.normalize(urlPath);
            this.uri = rawURI.slice(0, rawURI.length - urlCut[1].length) + optimizedPath;
        } else {
            this.uri = path.normalize(rawURI);
        }
    } else if (kw.o1 && !isURL) {
        const content = this.asRawString();
        if (content.slice(0, 5) === 'data:') {
            try {
                const out = sdu.decode(content);
                self = this.optimizeDataURI(out);
                if (!self) {
                    return null;
                }
            } catch (e) {
                return null;
            }
        }
    }

    if (self.uri instanceof objects.String) {
        self.uri = self.uri.optimize(kw);
        if (!self.uri) {
            return null;
        }
    }
    return self;
};

/**
 * Optimizes data URIs
 * @param  {Buffer} data The output of strong-data-uri
 * @return {URI}      The optimized URI
 */
URI.prototype.optimizeDataURI = function optimizeDataURI(data) {
    let newContent;
    if (data.mimetype === 'image/svg+xml') {
        const s = new svgo({});
        try {
            s.optimize(data.toString('utf-8'), data => {
                newContent = data.data;
            });
        } catch (e) {
            return this;
        }

    } else {
        return this;
    }

    if (!newContent) {
        return null;
    }

    return new URI(sdu.encode(newContent, data.mimetype));
};

/**
 * Returns whether the URI is a URL
 * @return {Boolean}
 */
URI.prototype.isURL = function isURL() {
    const content = this.asRawString();
    if (content.slice(0, 5) === 'data:') {
        return false;
    }

    if (content.slice(0, 5) === 'file:') {
        return false;
    }

    return true;
};

module.exports = URI;
