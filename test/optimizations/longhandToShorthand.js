const assert = require('assert');

const crass = require('../../src');

const parseString = (data, kw) => {
    return crass.parse(data).optimize(kw || {}).toString();
};
const parseCompare = (data, expected, kw) => {
    if (kw) {
        if (kw.o1 && data !== expected) {
            assert.notEqual(parseString(data), expected);
        }
        assert.equal(parseString(data, kw), expected);
        assert.equal(parseString(crass.parse(data).pretty(), kw), expected);
    } else {
        assert.equal(parseString(data), expected);
    }
};


describe('Merge longhand declarations into shorthand', () => {
    it('collapses longhand declarations into a shorthand declaration when all 4 pieces are specified', () => {
        parseCompare(
            `b{padding-bottom: unused;padding-left: left;padding-right: right;padding-top: top;padding-bottom:bottom}`,
            'b{padding:top right bottom left}'
        );
    });
    it('collapses longhand declarations when all 4 are the same value', () => {
        parseCompare(
            `b{padding-bottom: unused;padding-left: same;padding-right: same;padding-top: same;padding-bottom:same}`,
            'b{padding:same}'
        );
    });
    it('does not collapse declarations when not all 4 are specified', () => {
        parseCompare(
            `b{padding-bottom: unused;padding-right: right;padding-top: top;padding-bottom: bottom}`,
            `b{padding-bottom:bottom;padding-right:right;padding-top:top}`
        );
    });
});
