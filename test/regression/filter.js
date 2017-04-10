const assert = require('assert');

const crass = require('../../src');


describe('filters', () => {

    it('should handle semantic ui CSS filters', () => {
        assert.equal(
            crass.parse('.selector{filter:blur(5px) grayscale(0.7)}').optimize().toString(),
            '.selector{filter:blur(5px) grayscale(.7)}'
        );
    });
});
