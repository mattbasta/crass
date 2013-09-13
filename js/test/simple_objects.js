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
