var objects = require('../objects');
var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {array} selectors
 */
function SelectorList(selectors) {
    this.selectors = selectors;
}

/**
 * Adds a selector to the list
 * @param  {*} selector
 * @return {void}
 */
SelectorList.prototype.push = function(selector) {
    this.selectors.push(selector);
};

/**
 * @return {string}
 */
SelectorList.prototype.toString = function() {
    return utils.joinAll(this.selectors, ',');
};

/**
 * @return {string}
 */
SelectorList.prototype.pretty = function(indent) {
    var separator = this.toString().length < 80 ? ', ' : ',\n' + utils.indent(' ', indent).substr(1);
    return utils.joinAll(this.selectors, separator, utils.prettyMap(indent));
};

/**
 * @param {object} kw
 * @return {SelectorList}
 */
SelectorList.prototype.optimize = function(kw) {
    this.selectors = optimization.optimizeList(this.selectors, kw);

    // OPT: Ignore `* html` hacks from IE6
    if (!kw.saveie) {
        this.selectors = this.selectors.filter(s => !/\* html($| .+)/.exec(s.toString()));
    }

    // OPT: Sort selector lists.
    this.selectors = this.selectors.sort(function(a, b) {
        var ats = a.toString();
        var bts = b.toString();
        return ats < bts ? -1 : 1;
    });
    // OPT: Remove duplicate selectors in a selector list.
    this.selectors = utils.uniq(null, this.selectors);

    // OPT(O1): `.foo, *` -> `*`
    if (
        kw.o1 &&
        this.selectors.length > 1 &&
        this.selectors.some(i => i.toString() === '*')
    ) {
        this.selectors = [
            new objects.SimpleSelector([new (objects.ElementSelector)('*')]),
        ];
    }

    // TODO(opt): Merge selectors.
    return this;

};

module.exports = SelectorList;
