const assert = require('assert');

const crass = require('../../src');

const parseString = function(data, kw) {
    return crass.parse(data).optimize(kw || {}).toString();
};
const parseCompare = function(data, expected, kw) {
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

describe('linear-gradient', () => {
    describe('initial angle', () => {
        it('should convert "to top" to 0', () => {
            parseCompare(
                'x{background:linear-gradient(to top,#fff,#000)}',
                'x{background:linear-gradient(0,#fff,#000)}'
            );
        });
        it('should convert "to right" to 0', () => {
            parseCompare(
                'x{background:linear-gradient(to right,#fff,#000)}',
                'x{background:linear-gradient(90deg,#fff,#000)}'
            );
        });
        it('should convert "to bottom" to 0', () => {
            parseCompare(
                'x{background:linear-gradient(to bottom,#fff,#000)}',
                'x{background:linear-gradient(180deg,#fff,#000)}'
            );
        });
        it('should convert "to left" to 0', () => {
            parseCompare(
                'x{background:linear-gradient(to left,#fff,#000)}',
                'x{background:linear-gradient(270deg,#fff,#000)}'
            );
        });
        it('should not convert "to top right" to 0', () => {
            // carries over for other values also
            parseCompare(
                'x{background:linear-gradient(to top right,#fff,#000)}',
                'x{background:linear-gradient(to top right,#fff,#000)}'
            );
        });
    });
    describe('dimension reduction', () => {
        it('should reduce lengths if they are the same', () => {
            parseCompare(
                'x{background:linear-gradient(0,#fff 50%,#000 50%)}',
                'x{background:linear-gradient(0,#fff 50%,#000 0)}'
            );
        });
        it('should reduce lengths if they are less', () => {
            parseCompare(
                'x{background:linear-gradient(0,#fff 50%,#000 25%)}',
                'x{background:linear-gradient(0,#fff 50%,#000 0)}'
            );
        });
        it('should not reduce lengths if they are different units', () => {
            parseCompare(
                'x{background:linear-gradient(0,#fff 50%,#000 25px)}',
                'x{background:linear-gradient(0,#fff 50%,#000 25px)}'
            );
        });
        it('should not reduce trailing zeroes', () => {
            parseCompare(
                'x{background:linear-gradient(0,#fff 50%,#000 0)}',
                'x{background:linear-gradient(0,#fff 50%,#000 0)}'
            );
        });
        it('should reduce repeating radial gradient values', () => {
            parseCompare(
                'x{background:radial-gradient(0,#fff 5px,#888 5px,#000 50px)}',
                'x{background:radial-gradient(0,#fff 5px,#888 0,#000 50px)}'
            );
        });
    });

});
