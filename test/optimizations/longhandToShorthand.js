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
            'b{padding-bottom: unused;padding-left: left;padding-right: right;padding-top: top;padding-bottom:bottom}',
            'b{padding:top right bottom left}'
        );
    });
    it('collapses longhand declarations when all 4 are the same value', () => {
        parseCompare(
            'b{padding-bottom: unused;padding-left: same;padding-right: same;padding-top: same;padding-bottom:same}',
            'b{padding:same}'
        );
    });
    it('does not collapse declarations when not all 4 are specified', () => {
        parseCompare(
            'b{padding-bottom: unused;padding-right: right;padding-top: top;padding-bottom: bottom}',
            'b{padding-bottom:bottom;padding-right:right;padding-top:top}'
        );
    });
    it('should handle text-decoration', () => {
        parseCompare(
            `
            b {
                text-decoration-line: underline overline;
                text-decoration-style: dashed;
                text-decoration-color: red;
            }
            `,
            'b{text-decoration:underline overline dashed red}'
        );
    });

    it('should handle border shorthand', () => {
        parseCompare(
            `
            a {
                border-left-width: same;
                border-top-width: same;
                border-bottom-width: same;
                border-right-width: same;
                border-color: red;
                border-style: dashed;
            }
            `,
            'a{border:same dashed red}'
        );
    });
    it('should handle border-radius simple shorthand', () => {
        parseCompare(
            `
            a {
                border-top-left-radius: tl;
                border-top-right-radius: tr;
                border-bottom-right-radius: br;
                border-bottom-left-radius: bl;
            }
            `,
            'a{border-radius:tl tr br bl}'
        );
    });
    it('should handle border-radius complex shorthand', () => {
        parseCompare(
            `
            a {
                border-top-left-radius: tl1 tl2;
                border-top-right-radius: tr1 tr2;
                border-bottom-right-radius: br1 br2;
                border-bottom-left-radius: bl1 bl2;
            }
            `,
            'a{border-radius:tl1 tr1 br1 bl1/tl2 tr2 br2 bl2}'
        );
        parseCompare(
            `
            a {
                border-top-left-radius: tl1 tl2;
                border-top-right-radius: tr1;
                border-bottom-right-radius: br1 br2;
                border-bottom-left-radius: bl1 bl1;
            }
            `,
            'a{border-radius:tl1 tr1 br1 bl1/tl2 tr1 br2 bl1}'
        );
        parseCompare(
            `
            a {
                border-top-left-radius: tl1 tl2;
                border-top-right-radius: x;
                border-bottom-right-radius: br1 br2;
                border-bottom-left-radius: bl1 x;
            }
            `,
            'a{border-radius:tl1 x br1 bl1/tl2 x br2}'
        );
    });
});
