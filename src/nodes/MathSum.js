const objects = require('../objects');
const unitTypes = require('./helpers/unitTypes');


module.exports = class MathSum {
    /**
     * @constructor
     * @param {*} base
     * @param {string} operator
     * @param {Expression} term
     */
    constructor(base, operator, term) {
        this.base = base;
        this.operator = operator;
        this.term = term;
    }

    /**
     * @return {string}
     */
    toString() {
        var output = '';
        var base = this.base.toString();
        var term = this.term.toString();
        output += base;
        output += ' ';
        output += this.operator;
        output += ' ';
        output += term;
        return output;
    }

    /**
     * @return {string}
     */
    pretty() {
        var output = '';
        var base = this.base.pretty();
        var term = this.term.pretty();
        output += base;
        output += ' ';
        output += this.operator;
        output += ' ';
        output += term;
        return output;
    }

    /**
     * @param {object} kw
     * @return {MathSum}
     */
    optimize(kw) {
        this.base = this.base.optimize(kw);
        this.term = this.term.optimize(kw);

        if (!this.base || !this.term) {
            return null;
        }

        // OPT: Handle zero gracefully
        if (
            this.base instanceof objects.Dimension &&
            (this.term instanceof objects.Dimension || this.term instanceof objects.Number) &&
            this.term.asNumber() === 0
        ) {
            return this.base;

        } else if (
            this.term instanceof objects.Dimension &&
            (this.base instanceof objects.Dimension || this.base instanceof objects.Number) &&
            this.base.asNumber() === 0
        ) {
            if (this.operator === '+') {
                return this.term;
            }

            return new objects.Dimension(
                new objects.Number(this.term.asNumber() * -1),
                this.term.unit
            );
        }

        // OPT: drop invalid calculations
        if (
            this.base instanceof objects.Dimension &&
            this.term instanceof objects.Dimension &&
            this.base.unit in unitTypes &&
            this.term.unit in unitTypes &&
            unitTypes[this.base.unit] !== unitTypes[this.term.unit]
        ) {
            return null;
        }
        if (
            (
                this.base instanceof objects.Dimension &&
                this.term instanceof objects.Number
            ) ||
            (
                this.base instanceof objects.Number &&
                this.term instanceof objects.Dimension
            )
        ) {
            return null;
        }

        if (
            this.base instanceof objects.Dimension &&
            this.term instanceof objects.Dimension &&
            this.base.unit === this.term.unit
        ) {
            let val;
            if (this.operator === '+') {
                val = this.base.asNumber() + this.term.asNumber();
            } else if (this.operator === '-') {
                val = this.base.asNumber() - this.term.asNumber();
            } else {
                return this;
            }
            return new objects.Dimension(new objects.Number(val), this.base.unit);

        } else if (
            this.base instanceof objects.Number &&
            this.term instanceof objects.Number
        ) {
            if (this.operator === '+') {
                return new objects.Number(this.base.value + this.term.value);
            } else if (this.operator === '-') {
                return new objects.Number(this.base.value - this.term.value);
            }

        }

        return this;
    }

};
