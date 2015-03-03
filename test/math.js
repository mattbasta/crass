var assert = require("assert");

var crass = require('../crass');
var parseString = function(data) {
    return crass.parse(data).toString();
};


describe('Math Expressions', function() {
    it('should parse', function() {
        assert.equal(parseString('a{foo:calc(50% - 100px)}'), 'a{foo:calc(50% - 100px)}');
    });
    it('should parse with products', function() {
        assert.equal(parseString('a{foo:calc(50% * 100px)}'), 'a{foo:calc(50%*100px)}');
        assert.equal(parseString('a{foo:calc(50% / 100px)}'), 'a{foo:calc(50%/100px)}');
        assert.equal(parseString('a{foo:calc(5px + 50% * 100px)}'), 'a{foo:calc(5px + 50%*100px)}');
    });
    it('should parse with sums in products', function() {
        assert.equal(parseString('a{foo:calc((5px + 50%) * 100px)}'), 'a{foo:calc((5px + 50%)*100px)}');
        assert.equal(parseString('a{foo:calc(100px * (5px + 50%))}'), 'a{foo:calc(100px*(5px + 50%))}');
    });
    it('should pretty print', function() {
        assert.equal(
            crass.parse('a{foo:calc(50% * 100px)}').pretty(),
            'a {\n  foo: calc(50% * 100px);\n}\n'
        );
        assert.equal(
            crass.parse('a{foo:calc(50% * 100px+5px)}').pretty(),
            'a {\n  foo: calc(50% * 100px + 5px);\n}\n'
        );
    });
    it('should optimize the terms of a product', function() {
        assert.equal(
            crass.parse('a{foo:calc(12pt * 96px)}').optimize().toString(),
            'a{foo:calc(1pc*1in)}'
        );
    });
    it('should optimize the terms of a sum', function() {
        assert.equal(
            crass.parse('a{foo:calc(12pt + 96px)}').optimize().toString(),
            'a{foo:calc(1pc + 1in)}'
        );
        assert.equal(
            crass.parse('a{foo:calc(12pt - 96px)}').optimize().toString(),
            'a{foo:calc(1pc - 1in)}'
        );
    });
});
