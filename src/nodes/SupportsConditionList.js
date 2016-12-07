var objects = require('../objects');
var utils = require('../utils');


/**
 * @constructor
 * @param {string} combinator
 * @param {array} conditions
 */
function SupportsConditionList(combinator, conditions) {
    this.combinator = combinator;
    this.conditions = conditions;
}

/**
 * Adds an item to the head of the condition list
 * @param  {*} item
 * @return {void}
 */
SupportsConditionList.prototype.unshift = function unshift(item) {
    this.conditions.unshift(item);
};

/**
 * @return {string}
 */
SupportsConditionList.prototype.toString = function toString() {
    return utils.joinAll(
        this.conditions,
        ' ' + this.combinator + ' ',
        function(item) {
            var output = item.toString();
            return (item instanceof objects.SupportsConditionList && item.combinator !== this.combinator ||
                    item instanceof objects.Declaration) ? '(' + output + ')' : output;
        }
    );
};

/**
 * @return {string}
 */
SupportsConditionList.prototype.pretty = function pretty() {
    return this.toString();
};

/**
 * @param {object} kw
 * @return {SupportsConditionList}
 */
SupportsConditionList.prototype.optimize = function optimize(kw) {
    this.conditions = this.conditions.map(function(condition) {
        return condition.optimize(kw);
    });

    // OPT: Remove duplicate delcarations in @supports condition lists
    this.conditions = utils.uniq(null, this.conditions);

    // OPT: not(x) and not(y) and not(z) -> not(x or y or z)
    if (this.conditions.every(function(condition) {
        return condition instanceof objects.SupportsCondition && condition.negated;
    })) {
        var cond = new objects.SupportsCondition(new objects.SupportsConditionList(
            this.combinator === 'and' ? 'or' : 'and',
            this.conditions.map(function(condition) {
                return condition.condition;
            })
        ));
        cond.negate();
        return cond;
    }

    return this;
};

module.exports = SupportsConditionList;
