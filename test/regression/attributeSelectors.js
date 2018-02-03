const assert = require('assert');

const crass = require('../../src');


describe('attribute selectors', () => {
    it('should handle attribute values with unusual characters', () => {
        assert.equal(
            crass.parse('[foo^="tel:"]{a:b}').optimize().toString(),
            '[foo^="tel:"]{a:b}'
        );
    });
});
