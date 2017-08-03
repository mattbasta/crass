const optimization = require('../optimization');


const declsToNotOptimizePercents = {
    'height': true,
    'width': true,
    'flex': true,
    'flex-basis': true,
};

module.exports = class Dimension {
    /**
     * @constructor
     * @param {Number} number
     * @param {string} unit
     */
    constructor(number, unit) {
        this.number = number;
        this.unit = unit || '';
    }

    /**
     * Return just the numeric portion of the dimension, as a JS number
     * @return {number}
     */
    asNumber() {
        return this.number.asNumber();
    }

    /**
     * @return {string}
     */
    toString() {
        if (Math.abs(this.number.value) === 0 && this.unit !== '%') {
            return '0';
        } else {
            return this.number.toString() + this.unit;
        }
    }

    /**
     * @param {int} indent
     * @return {string}
     */
    pretty(indent) {
        return this.number.pretty(indent) + this.unit;
    }

    /**
     * @param {object} kw
     * @return {Dimension}
     */
    optimize(kw) {
        if (!this.unit) {
            return this.number;
        }
        if (
            kw.func !== 'hsl' &&
            kw.func !== 'hsla' &&
            Math.abs(this.number.value) === 0 &&
            !(kw.declarationName in declsToNotOptimizePercents)
        ) {
            return this.number;
        }
        return optimization.unit(this, kw);
    }
};
