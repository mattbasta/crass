var assert = require("assert");

var crass = require('../crass');


describe('!important', function() {
    it('should parse appropriately', function() {
        assert.equal(
            crass.parse('foo {a: b !important}').toString(),
            'foo{a:b!important}'
        );
    });
    it('should pretty print appropriately', function() {
        assert.equal(
            crass.parse('foo {a: b !important}').pretty(),
            'foo {\n  a: b !important;\n}\n'
        );
    });
});
