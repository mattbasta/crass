var objects = require('../objects');
var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {SelectorList} selector
 * @param {Declaration[]} content
 */
function Ruleset(selector, content) {
    this.selector = selector;
    this.content = content;
}

/**
 * Returns the declaration content of the ruleset.
 * @return {string}
 */
Ruleset.prototype.contentToString = function() {
    return utils.joinAll(this.content, ';');
};

/**
 * Finds the intersection of declarations between this ruleset and the set of
 * declarations for a provided ruleset.
 * @param  {Ruleset} ruleset
 * @return {Declaration[]}
 */
Ruleset.prototype.declarationIntersections = function(ruleset) {
    var myDeclarations = this.content.map(function(decl) {
        return decl.ident;
    });
    var intersection = [];
    for (var i = 0; i < this.content.length; i++) {
        if (myDeclarations.indexOf(this.content[i].ident) !== -1) {
            intersection.push(this.content[i].ident);
        }
    }
    return intersection;
};

/**
 * Removes a declaration with the provided name from the ruleset
 * @param  {string} name
 * @return {void}
 */
Ruleset.prototype.removeDeclaration = function(name) {
    this.content = this.content.filter(function(decl) {
        return decl.ident !== name;
    });
};


/**
 * @return {string}
 */
Ruleset.prototype.toString = function toString() {
    return this.selector.toString() + '{' + this.contentToString() + '}';
};

/**
 * @param {int} indent
 * @return {string}
 */
Ruleset.prototype.pretty = function pretty(indent) {
    var output = '';
    output += utils.indent(this.selector.pretty(indent) + ' {', indent) + '\n';
    output += this.content.map(function(line) {
        return utils.indent(line.pretty(indent + 1) + ';', indent + 1);
    }).join('\n') + '\n';
    output += utils.indent('}', indent) + '\n';
    return output;
};

/**
 * Optimizes the declarations within this ruleset
 * @param  {object} kw
 * @return {void}
 */
Ruleset.prototype.optimizeContent = function(kw) {
    this.content = optimization.optimizeDeclarations(this.content, kw);
};

/**
 * @param {object} kw
 * @return {Ruleset}
 */
Ruleset.prototype.optimize = function optimize(kw) {
    // OPT: Ignore `* html` hacks from IE6
    if (!kw.saveie &&
        // Ignore selector lists, which handle this case separately
        !(this.selector instanceof objects.SelectorList) &&
        /\* html($| .+)/.exec(this.selector.toString())) {
        return null;
    }

    this.selector = optimization.try_(this.selector, kw);
    if (!this.selector) {
        return null;
    }

    this.optimizeContent(kw);

    // OPT: Remove empty rulsets.
    if (!this.content.length) {
        return null;
    }
    return this;
};

module.exports = Ruleset;
