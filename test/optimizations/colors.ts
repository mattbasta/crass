import * as assert from 'assert';
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


describe('colors', () => {
    it('should drop invalid colors', () => {
        const isDropped = css => assert.equal(crass.parse(css).optimize().toString(), '', `${css} should have been dropped`);

        isDropped('a{color:rgb(1,2)}');
        isDropped('a{color:rgb(1,2,3,4)}');
        isDropped('a{color:rgb(1,2,foo)}');
        isDropped('a{color:gray(1/2 3)}');
        isDropped('a{color:hwb(4% 0 5%)}'); // arg 1 should be dimension
        isDropped('a{color:hwb(4% 5% 6)}'); // arg 2 should be dimension
        isDropped('a{color:lch(foo 1 1)}'); // arg 0 should be dimension or num
    });
    it('clamp colors to zero', () => {
        assert.equal(
            crass.parse('b{color:rgba(-100,0,-100,.5)}').optimize().toString(),
            'b{color:rgba(0,0,0,.5)}'
        );
    });

    it('long hex to short hex', () => {
        parseCompare(
            'b{color:#ffffff}',
            'b{color:#fff}'
        );
        parseCompare(
            'b{color:rgb(0,0,0)}',
            'b{color:#000}'
        );
    });

    it('rgb with short hex', () => {
        parseCompare(
            'b{color:rgb(255,255,255)}',
            'b{color:#fff}'
        );
        parseCompare(
            'b{color:rgb(0,0,0)}',
            'b{color:#000}'
        );
    });
    it('rgb with long hex', () => {
        parseCompare(
            'b{color:rgb(255,255,254)}',
            'b{color:#fffffe}'
        );
    });
    it('rgb with name', () => {
        parseCompare(
            'b{color:rgb(255,0,0)}',
            'b{color:red}'
        );
    });
    it('hex with name', () => {
        parseCompare(
            'b{color:#f00}',
            'b{color:red}'
        );
    });
    it('name with hex', () => {
        parseCompare(
            'b{color:blanchedalmond}',
            'b{color:#ffebcd}'
        );
    });

    it('hsl with short hex', () => {
        parseCompare(
            'b{color:hsl(0,0%,100%)}',
            'b{color:#fff}'
        );
    });
    it('hsl with degrees', () => {
        parseCompare(
            'b{color:hsl(0deg,0%,100%)}',
            'b{color:#fff}'
        );
        parseCompare(
            'b{color:hsl(360deg,0%,100%)}',
            'b{color:#fff}'
        );
        parseCompare(
            'b{color:hsl(180deg,0%,100%)}',
            'b{color:#fff}'
        );
        parseCompare(
            'b{color:hsl(180deg,50%,50%)}',
            'b{color:#40bf50}'
        );
    });
    it('hsl with long hex', () => {
        parseCompare(
            'b{color:hsl(1,100%,50%)}',
            'b{color:#ff0400}'
        );
    });

    it('rgba with hsla', () => {
        parseCompare(
            'b{color:rgba(255,255,255,.1)}',
            'b{color:hsla(0,0%,100%,.1)}'
        );
    });

    it('hsla with rgba', () => {
        parseCompare(
            'b{color:hsla(255,99%,10%,.1)}',
            'b{color:rgba(13,0,51,.1)}'
        );
    });

    it('rgba with name', () => {
        parseCompare(
            'b{color:rgba(255,0,0,1)}',
            'b{color:red}'
        );
    });

    it('should clamp opacity', () => {
        parseCompare(
            'b{color:rgba(255,0,0,1.1)}',
            'b{color:red}'
        );
        parseCompare(
            'b{color:rgba(255,0,0,-0.1)}',
            'b{color:transparent}'
        );
    });

    it('should not shorten to gray when there is an alternative', () => {
        parseCompare(
            'b{color:rgb(255,255,255)}',
            'b{color:#fff}',
            {css4: true}
        );
        parseCompare(
            'b{color:hsl(0,0%,100%)}',
            'b{color:#fff}',
            {css4: true}
        );
    });
    it('should collapse alpha values of 1', () => {
        parseCompare(
            'b{color:rgba(255,255,255, 1)}',
            'b{color:#fff}',
            {css4: true}
        );
        parseCompare(
            'b{color:hsla(0,0%,0%, 1)}',
            'b{color:#000}',
            {css4: true}
        );
    });
    it('should generate gray', () => {
        parseCompare(
            'b{color:rgba(255,255,255,0.5)}',
            'b{color:gray(100%/.5)}',
            {css4: true}
        );
        parseCompare(
            'b{color:hsla(0,0%,50%, 0.5)}',
            'b{color:lab(53 0 0/.5)}',
            {css4: true}
        );
    });
    it('should collapse gray values to keyword', () => {
        parseCompare(
            'b{color:hsl(0,0%,50%)}',
            'b{color:gray}',
            {css4: true}
        );
    });

    it('should generate hwb', () => {
        parseCompare(
            'b{color:rgba(255,0,0,.5)}',
            'b{color:hwb(0 0% 0%/.5)}',
            {css4: true}
        );
    });
    it('should generate alpha hex', () => {
        parseCompare(
            'b{color:rgba(255,0,0,0)}',
            'b{color:#0000}',
            {css4: true}
        );
        parseCompare(
            'b{color:rgba(255,0,0,0.2)}',
            'b{color:#f003}',
            {css4: true}
        );
        parseCompare(
            'b{color:#aabbccdd}',
            'b{color:#abcd}',
            {css4: true}
        );
        parseCompare(
            'b{color:#abcdef11}',
            'b{color:#abcdef11}',
            {css4: true}
        );
    });
});
