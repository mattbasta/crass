const assert = require('assert');

const crass = require('../../src');


describe('invalid charsets', () => {

    it('should be dropped', () => {
        assert.equal(
            crass.parse('a{x:y}@charset "foo";').toString(),
            'a{x:y}'
        );
    });
});
