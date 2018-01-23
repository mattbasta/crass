const assert = require('assert');

const crass = require('../../src');


describe('calc()', () => {
    it('should handle MathSum sign changes correctly', () => {
        assert.equal(
            crass.parse('a{b:calc(1px - (2em + 3vh) + 4vw)}').optimize().toString(),
            'a{b:calc(1px - 2em - 3vh + 4vw)}'
        );
    });
    it('should handle MathSum evaluation well', () => {
        assert.equal(
            crass.parse('a{b:calc(3px - 2px + 1px - 0px)}').optimize().toString(),
            'a{b:2px}'
        );
    });
    it('should reduce nested MathSum expressions appropraitely when the MathSum is on the lhs', () => {
        assert.equal(
            crass.parse('a{b:calc((2px + 3vh) - 1px)}').optimize().toString(),
            'a{b:calc(1px + 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc((2vh + 3px) - 1px)}').optimize().toString(),
            'a{b:calc(2vh + 2px)}'
        );
        assert.equal(
            crass.parse('a{b:calc((2px + 3vh) + 1px)}').optimize().toString(),
            'a{b:calc(3px + 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc((2vh + 3px) + 1px)}').optimize().toString(),
            'a{b:calc(2vh + 4px)}'
        );

        assert.equal(
            crass.parse('a{b:calc((2px - 3vh) - 1px)}').optimize().toString(),
            'a{b:calc(1px - 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc((2vh - 3px) - 1px)}').optimize().toString(),
            'a{b:calc(2vh - 4px)}'
        );
        assert.equal(
            crass.parse('a{b:calc((2px - 3vh) + 1px)}').optimize().toString(),
            'a{b:calc(3px - 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc((2vh - 3px) + 1px)}').optimize().toString(),
            'a{b:calc(2vh - 2px)}'
        );
    });
    it('should reduce nested MathSum expressions appropraitely when the MathSum is on the rhs', () => {
        assert.equal(
            crass.parse('a{b:calc(1px - (2px + 3vh))}').optimize().toString(),
            'a{b:calc(-1px - 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc(1px - (2vh + 3px))}').optimize().toString(),
            'a{b:calc(-2px - 2vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc(1px + (2px + 3vh))}').optimize().toString(),
            'a{b:calc(3px + 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc(1px + (2vh + 3px))}').optimize().toString(),
            'a{b:calc(4px + 2vh)}'
        );

        assert.equal(
            crass.parse('a{b:calc(1px - (2px - 3vh))}').optimize().toString(),
            'a{b:calc(-1px + 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc(1px - (2vh - 3px))}').optimize().toString(),
            'a{b:calc(4px - 2vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc(1px + (2px - 3vh))}').optimize().toString(),
            'a{b:calc(3px - 3vh)}'
        );
        assert.equal(
            crass.parse('a{b:calc(1px + (2vh - 3px))}').optimize().toString(),
            'a{b:calc(-2px + 2vh)}'
        );
    });
});
