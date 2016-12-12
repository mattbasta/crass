const assert = require('assert');

const crass = require('../../src');


describe('css variables', () => {

    it('should handle variable definitions', () => {
        assert.equal(
            crass.parse('a{--foo:bar}').optimize().toString(),
            'a{--foo:bar}'
        );
    });
    it('should handle variable uses', () => {
        assert.equal(
            crass.parse('a{foo: var(--bar)}').optimize().toString(),
            'a{foo:var(--bar)}'
        );
        assert.equal(
            crass.parse('.wrapper{--border:#000}#navigation div{border:1px solid var(--border)}').optimize().toString(),
            '.wrapper{--border:#000}#navigation div{border:1px solid var(--border)}'
        );
    });

});
