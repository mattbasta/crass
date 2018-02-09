const assert = require('assert');

const crass = require('../../src');


describe('attribute selectors', () => {
    it('should handle attribute values with unusual characters', () => {
        assert.equal(
            crass.parse('[foo^="tel:"]{a:b}').optimize().toString(),
            '[foo^="tel:"]{a:b}'
        );
        assert.equal(
            crass.parse('[foo^="0"]{a:b}').optimize().toString(),
            '[foo^="0"]{a:b}'
        );
        assert.equal(
            crass.parse('[foo^="bar"]{a:b}').optimize().toString(),
            '[foo^=bar]{a:b}'
        );
        assert.equal(
            crass.parse('[foo^="bar0"]{a:b}').optimize().toString(),
            '[foo^=bar0]{a:b}'
        );
    });
});
