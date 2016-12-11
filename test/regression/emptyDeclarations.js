const assert = require('assert');

const crass = require('../../src');


describe('empty declarations', () => {

    it('should render', () => {
        assert.equal(
            crass.parse('a{b:;}').toString(),
            'a{b:}'
        );
        assert.equal(
            crass.parse('a{b:}').toString(),
            'a{b:}'
        );
    });
    it('should pretty print', () => {
        assert.equal(
            crass.parse('a{b:;}').pretty(),
            'a {\n  b: ;\n}\n'
        );
        assert.equal(
            crass.parse('a{b:}').pretty(),
            'a {\n  b: ;\n}\n'
        );
    });
    it('should optimize away', () => {
        assert.equal(
            crass.parse('a{b:;}').optimize().toString(),
            ''
        );
        assert.equal(
            crass.parse('a{b:}').optimize().toString(),
            ''
        );
    });

});
