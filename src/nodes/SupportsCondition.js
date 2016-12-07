var objects = require('../objects');


/**
 * @constructor
 * @param {Declaration} condition
 */
function SupportsCondition(condition) {
    this.condition = condition;
    this.negated = false;
}

/**
 * Negates the condition
 * @return {void}
 */
SupportsCondition.prototype.negate = function negate() {
	this.negated = !this.negated;
};

/**
 * @return {string}
 */
SupportsCondition.prototype.toString = function toString() {
    var output = '';
    if (this.negated) output = 'not ';
    output += '(';
    output += this.condition;
    output += ')';
    return output;
};

/**
 * @return {string}
 */
SupportsCondition.prototype.pretty = function pretty() {
	return this.toString();
};

/**
 * @param {object} kw
 * @return {SupportsCondition}
 */
SupportsCondition.prototype.optimize = function optimize(kw) {
    this.condition = this.condition.optimize(kw);
    // OPT: not(not(foo:bar)) -> (foo:bar)
    if (this.condition instanceof objects.SupportsCondition &&
        this.negated && this.condition.negated) {
        this.condition.negate();
        return this.condition;
    }
    return this;
};

module.exports = SupportsCondition;
