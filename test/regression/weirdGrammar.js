const assert = require('assert');

const crass = require('../../src');


describe('weird grammar regressions', () => {

    it('should handle escaped identifiers', () => {
        assert.equal(
            crass.parse('.\\31 0\\+{x:y}').optimize().toString(),
            '.\\31 0\\+{x:y}'
        );
    });
});
