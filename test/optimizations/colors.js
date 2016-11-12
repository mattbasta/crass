var assert = require('assert');

var crass = require('../../crass');

var parseString = function(data, kw) {
    return crass.parse(data).optimize(kw || {}).toString();
};
var parseCompare = function(data, expected, kw) {
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


describe('colors', function() {
    it('long hex to short hex', function() {
        parseCompare(
            'b{color:#ffffff}',
            'b{color:#fff}'
        );
        parseCompare(
            'b{color:rgb(0,0,0)}',
            'b{color:#000}'
        );
    });

    it('rgb with short hex', function() {
        parseCompare(
            'b{color:rgb(255,255,255)}',
            'b{color:#fff}'
        );
        parseCompare(
            'b{color:rgb(0,0,0)}',
            'b{color:#000}'
        );
    });
    it('rgb with long hex', function() {
        parseCompare(
            'b{color:rgb(255,255,254)}',
            'b{color:#fffffe}'
        );
    });
    it('rgb with name', function() {
        parseCompare(
            'b{color:rgb(255,0,0)}',
            'b{color:red}'
        );
    });
    it('hex with name', function() {
        parseCompare(
            'b{color:#f00}',
            'b{color:red}'
        );
    });
    it('name with hex', function() {
        parseCompare(
            'b{color:blanchedalmond}',
            'b{color:#ffebcd}'
        );
    });

    it('hsl with short hex', function() {
        parseCompare(
            'b{color:hsl(0,0%,100%)}',
            'b{color:#fff}'
        );
    });
    it('hsl with degrees', function() {
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
    it('hsl with long hex', function() {
        parseCompare(
            'b{color:hsl(1,100%,50%)}',
            'b{color:#ff0400}'
        );
    });

    it('rgba with hsla', function() {
        parseCompare(
            'b{color:rgba(255,255,255,.1)}',
            'b{color:hsla(0,0%,100%,.1)}'
        );
    });

    it('hsla with rgba', function() {
        parseCompare(
            'b{color:hsla(255,99%,10%,.1)}',
            'b{color:rgba(13,0,51,.1)}'
        );
    });

    it('rgba with name', function() {
        parseCompare(
            'b{color:rgba(255,0,0,1)}',
            'b{color:red}'
        );
    });

    it('should clamp opacity', function() {
        parseCompare(
            'b{color:rgba(255,0,0,1.1)}',
            'b{color:red}'
        );
        parseCompare(
            'b{color:rgba(255,0,0,-0.1)}',
            'b{color:transparent}'
        );
    });

    it('should not mangle invalid colors', function() {
        parseCompare(
            'b{color:rgb(255,0,0,5%)}',
            'b{color:rgb(255,0,0,5%)}'
        );
        parseCompare(
            'b{color:rgba(255,0,0)}',
            'b{color:rgba(255,0,0)}'
        );
    });

    it('should not shorten to gray when there is an alternative', function() {
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
    it('should collapse alpha values of 1', function() {
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
    it('should generate gray', function() {
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
    it('should collapse gray values to keyword', function() {
        parseCompare(
            'b{color:hsl(0,0%,50%)}',
            'b{color:gray}',
            {css4: true}
        );
    });

    it('should generate hwb', function() {
        parseCompare(
            'b{color:rgba(255,0,0,.5)}',
            'b{color:hwb(0 0% 0%/.5)}',
            {css4: true}
        );
    });
    it('should generate alpha hex', function() {
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
