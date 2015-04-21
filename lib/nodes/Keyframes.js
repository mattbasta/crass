var browserSupport = require('../browser_support');
var objects = require('../objects');
var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} name
 * @param {*} content
 * @param {string} vendorPrefix
 */
function Keyframes(name, content, vendorPrefix) {
    this.name = name;
    this.content = content;
    this.vendorPrefix = vendorPrefix;
}

/**
 * @return {string}
 */
Keyframes.prototype.getBlockHeader = function getBlockHeader() {
    return this.vendorPrefix ? '@' + this.vendorPrefix + 'keyframes ' : '@keyframes ';
};

/**
 * @return {string}
 */
Keyframes.prototype.toString = function toString() {
    var output = this.getBlockHeader();
    output += this.name;
    output += '{';
    output += utils.joinAll(this.content);
    output += '}';
    return output;
};

/**
 * @param {int} indent
 * @return {string}
 */
Keyframes.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent(this.getBlockHeader() + this.name + ' {') + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1), indent);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {Keyframes}
 */
Keyframes.prototype.optimize = function optimize(kw) {
    // OPT: Remove unsupported keyframes blocks.
    if (!browserSupport.supportsKeyframe(this.vendorPrefix, kw)) {
        return null;
    }

    if (this.vendorPrefix) {
        kw.vendorPrefix = this.vendorPrefix;
    }

    // OPT: Combine keyframes with identical stops.
    this.content = optimization.combineList(
        function(item) {return item.stop.toString();},
        function(a, b) {
            return new objects.Keyframe(a.stop, a.content.concat(b.content));
        },
        this.content
    );
    // OPT: Sort keyframes.
    this.content = this.content.sort(function(a, b) {
        return a.stop.toString().localeCompare(b.stop.toString());
    });

    this.content = optimization.optimizeList(this.content, kw);

    // OPT: Combine duplicate keyframes
    var cache = {};
    this.content = this.content.reduce(function(a, b) {
        var content = b.content.toString();
        if (content in cache) {
            cache[content].stop = cache[content].stop.concat(b.stop);
            return a;
        }
        cache[content] = b;
        a.push(b);
        return a;
    }, []);

    delete kw.vendorPrefix;

    return this;
};


module.exports = Keyframes;
