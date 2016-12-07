var optimization = require('../optimization');
var utils = require('../utils');


/**
 * @constructor
 * @param {array} conditions
 */
function SimpleSelector(conditions) {
    this.conditions = conditions;
}

/**
 * @return {string}
 */
SimpleSelector.prototype.toString = function toString() {
    return utils.joinAll(this.conditions);
};

/**
 * @param {int} indent
 * @return {string}
 */
SimpleSelector.prototype.pretty = function pretty(indent) {
    return utils.joinAll(this.conditions, null, utils.prettyMap(indent));
};

/**
 * @param {object} kw
 * @return {SimpleSelector}
 */
SimpleSelector.prototype.optimize = function optimize(kw) {
    this.conditions = optimization.optimizeList(this.conditions, kw);
    // OPT: Remove duplicate conditions from a simple selector.
    this.conditions = utils.uniq(null, this.conditions);

    // OPT(O1): Remove unnecessary wildcard selectors
    if (kw.o1 && this.conditions.length > 1) {
        this.conditions = this.conditions.filter(function(item) {
            return item.toString() !== '*';
        });
    }
    return this;
};

module.exports = SimpleSelector;
