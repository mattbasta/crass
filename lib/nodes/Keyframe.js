var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} stop
 * @param {*} content
 */
function Keyframe(stop, content) {
    this.stop = stop;
    this.content = content;
}

/**
 * @return {string}
 */
Keyframe.prototype.toString = function toString() {
    return utils.joinAll(this.stop, ',') + '{' + this.toStringBody() + '}';
};

/**
 * @return {string}
 */
Keyframe.prototype.toStringBody = function toStringBody() {
    return utils.joinAll(this.content, ';');
};

/**
 * @param {int} indent
 * @return {string}
 */
Keyframe.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent(
        utils.joinAll(
            this.stop, ', ',
            function(x) {return x.pretty(indent);}
        ) + ' {',
        indent) + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * @param {object} kw
 * @return {Keyframe}
 */
Keyframe.prototype.optimize = function optimize(kw) {
    this.stop = optimization.optimizeList(this.stop, kw);
    this.content = optimization.optimizeDeclarations(this.content, kw);
    return this;
};


module.exports = Keyframe;
