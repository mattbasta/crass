'use strict';

const colors = require('../colors');
const objects = require('../objects');
const optimization = require('../optimization');


/**
 * @constructor
 * @param {array[]} chain
 */
function Expression(chain) {
    this.chain = chain;
}

/**
 * @return {string}
 */
Expression.prototype.toString = function toString() {
    let output = '';
    for (let i = 0; i < this.chain.length; i++) {
        if (i) {
            output += this.chain[i][0] || ' ';
        }
        output += this.chain[i][1].toString();
    }
    return output;
};

/**
 * @param {int} indent
 * @return {string}
 */
Expression.prototype.pretty = function pretty(indent) {
    let output = '';
    for (let i = 0; i < this.chain.length; i++) {
        if (i) {
            if (this.chain[i][0] === ',') {
                output += ', ';
            } else if (!this.chain[i][0]) {
                output += ' ';
            } else {
                output += this.chain[i][0];
            }
        }
        const val = this.chain[i][1];
        if (val.pretty) {
            output += val.pretty(indent);
        } else {
            output += val.toString();
        }
    }
    return output;
};

/**
 * @param {object} kw
 * @return {Expression}
 */
Expression.prototype.optimize = function optimize(kw) {
    this.chain = this.chain.map(v => [v[0], optimization.try_(v[1], kw)]).filter(v => !!v[1]);

    if (!kw.declarationName) return this;

    // OPT: Try to minify lists of lengths.
    // e.g.: `margin:0 0 0 0` -> `margin:0`
    if (
        kw.declarationName in optimization.quadLists &&
        this.chain.length > 2 &&
        this.chain.length <= 4 &&
        this.chain.every(c => c[0] !== '/')
    ) {
        this.chain = this.processQuadList(this.chain);

    } else if (
        kw.declarationName === 'border-radius' &&
        this.chain.some(x => x[0] === '/')
    ) {
        const slashIdx = this.findSlash();
        const leftChain = this.chain.slice(0, slashIdx);
        const rightChain = this.chain.slice(slashIdx).map(x => [null, x[1]]);

        const pLeftChain = this.processQuadList(leftChain);
        const pRightChain = this.processQuadList(rightChain);

        pRightChain[0][0] = '/';
        this.chain = pLeftChain.concat(pRightChain);

    } else if (
        kw.declarationName === 'font-weight' ||
        kw.declarationName === 'font'
    ) {
        this.chain = this.chain.map(chunk => {
            // OPT: font/font-weight: normal -> 400
            if (chunk[1].toString() === 'normal')
                return [chunk[0], '400'];
            // OPT: font/font-weight: bold -> 700
            else if (chunk[1].toString() === 'bold')
                return [chunk[0], '700'];
            else
                return chunk;
        });

    } else if (
        kw.o1 && kw.declarationName === 'content' &&
        this.chain[0][1] === 'none'
    ) {
        // OPT: `content:none` -> `content:""`
        this.chain[0][1] = new objects.String('');
    }

    if (
        kw.declarationName in optimization.noneables &&
        this.chain.length === 1 &&
        this.chain[0][1].toString() === 'none'
    ) {
        // OPT: none -> 0 where possible.
        this.chain[0][1] = '0';
    }

    // OPT: Convert color names to hex when possible.
    this.chain.forEach(term => {
        if (typeof term[1] === 'string' && term[1] in colors.COLOR_TO_HEX) {
            term[1] = new objects.HexColor(colors.COLOR_TO_HEX[term[1]]);
        }
    });

    if (!this.chain.length) {
        return null;
    }

    return this;
};

/**
 * @param {array[][]} list
 * @return {array[][]}
 */
Expression.prototype.processQuadList = function processQuadList(list) {
    let keys = list.map(v => v[1].toString());
    if (
        keys.length === 4 &&
        keys[0] == keys[1] &&
        keys[1] === keys[2] &&
        keys[2] === keys[3]
    ) {
        return [list[0]];
    }
    if (keys.length === 4 && keys[0] === keys[2] && keys[1] === keys[3]) {
        list = [list[0], list[1]];
        keys = [keys[0], keys[1]];
    } else if (keys.length === 4 && keys[1] === keys[3]) {
        list = list.slice(0, 3);
        keys = keys.slice(0, 3);
    }
    if (keys.length === 3 && keys[0] === keys[2]) {
        list = list.slice(0, 2);
        keys = keys.slice(0, 2);
    }
    if (keys.length === 2 && keys[0] === keys[1]) {
        return list.slice(0, 1);
    }

    return list;
};

/**
 * @return {int}
 */
Expression.prototype.findSlash = function findSlash() {
    for (let i = 0; i < this.chain.length; i++) {
        if (this.chain[i][0] === '/') {
            return i;
        }
    }
    return -1;
};

module.exports = Expression;
