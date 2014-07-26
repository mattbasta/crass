var assert = require("assert");

var crass = require('../crass');
var parseString = function(data) {
    return crass.parse(data).toString();
};


describe('Strings', function() {
    it('can be empty', function() {
        assert.equal(parseString('a{content:""}'), 'a{content:""}');
    });
    it('can contain a single char', function() {
        assert.equal(parseString('a{content:"("}'), 'a{content:"("}');
    });
    it('can contain another single char', function() {
        assert.equal(parseString('a{content:"a"}'), 'a{content:"a"}');
    });
    it('can contain escaped quotes', function() {
        assert.equal(parseString('a{content:\'\\\'\'}'), 'a{content:"\'"}');
        assert.equal(parseString('a{content:"\\""}'), 'a{content:\'"\'}');
    });
    it('can contain escaped line breaks', function() {
        assert.equal(parseString('a{content:"\\\n"}'), 'a{content:"\\\n"}');
    });
});


describe('Numbers', function() {
    it('should omit a leading 0 in negative floating point numbers', function() {
        assert.equal(parseString('a{foo:-0.5}'), 'a{foo:-.5}');
    });
    it('should not optimize', function() {
        assert.equal(crass.parse('a{foo:-.5}').optimize().toString(), 'a{foo:-.5}');
    });
    it('should strip units when the dimension is zero', function() {
        assert.equal(crass.parse('a{foo:0px}').toString(), 'a{foo:0}');
    });
    it('should not strip units when the dimension is zero percent', function() {
        assert.equal(crass.parse('a{foo:0%}').toString(), 'a{foo:0%}');
    });
});


describe('Identifiers', function() {
    it('can be normal identifiers', function() {
        assert.equal(parseString('a{foo:bar}'), 'a{foo:bar}');
    });
    it('can be n-resize', function() {
        assert.equal(parseString('a{nearly-cursor:n-resize}'), 'a{nearly-cursor:n-resize}');
    });
    it('can be not-allowed', function() {
        assert.equal(parseString('a{nearly-cursor:not-allowed}'), 'a{nearly-cursor:not-allowed}');
    });
    it('can be use old hacks in declaration names', function() {
        assert.equal(parseString('a{*foo: bar;}'), 'a{*foo:bar}');
    });
});


describe('Math Expressions', function() {
    it('should parse', function() {
        assert.equal(parseString('a{foo:calc(50% - 100px)}'), 'a{foo:calc(50%-100px)}');
    });
    it('should parse with products', function() {
        assert.equal(parseString('a{foo:calc(50% * 100px)}'), 'a{foo:calc(50%*100px)}');
        assert.equal(parseString('a{foo:calc(5px + 50% * 100px)}'), 'a{foo:calc(5px+50%*100px)}');
    });
    it('should parse with sums in products', function() {
        assert.equal(parseString('a{foo:calc((5px + 50%) * 100px)}'), 'a{foo:calc((5px+50%)*100px)}');
        assert.equal(parseString('a{foo:calc(100px * (5px + 50%))}'), 'a{foo:calc(100px*(5px+50%))}');
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
            'a{foo:calc(1pc+1in)}'
        );
    });
});
