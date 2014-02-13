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
    it('are parsed', function() {
        assert.equal(parseString('a{foo:calc(50% - 100px)}'), 'a{foo:calc(50%-100px)}');
    });
});


describe('Units', function() {
    it('should strip the unit if the value is 0', function() {
        assert.equal(parseString('a{foo:0px}'), 'a{foo:0}');
        assert.equal(parseString('a{foo:0kHz}'), 'a{foo:0}');
    });
});
