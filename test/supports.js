var assert = require("assert");

var crass = require('../crass');

var filler = '.foo{x:y}';
var parity = function(data) {
    data = data.replace(/\$\$/g, filler);
    assert.equal(crass.parse(data).toString(), data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), data);
}


describe('@supports', function() {
    it('should parse basic supports block', function() {
        var parsed = crass.parse('@supports (foo: bar) {a{x:y}}');
        assert.equal(parsed.content.length, 1);
        assert(parsed.content[0].condition_list);

        assert.equal(parsed.toString(), '@supports (foo:bar){a{x:y}}')
    });
    it('should parse supports block with parens in declaration', function() {
        parity('@supports (foo:"(asdf)" rotate(.1deg)){$$}');
    });
    it('should parse supports block with negation', function() {
        parity('@supports not (foo:bar){$$}');
    });
    it('should parse supports block with or combination', function() {
        parity('@supports (foo:bar) or (zip:zap) or (fizz:buzz){$$}');
    });
    it('should parse supports block with and combination', function() {
        parity('@supports (foo:bar) and (zip:zap) and (fizz:buzz){$$}');
    });
    it('should parse supports block with combination and negation', function() {
        parity('@supports (foo:bar) and not (zip:zap) and (fizz:buzz){$$}');
    });
    it('should parse supports block with multiple combinations', function() {
        parity('@supports (foo:bar) and ((zip:zap) or (fizz:buzz)){$$}');
    });
    it('should parse supports block with negated combinations', function() {
        parity('@supports (foo:bar) and not ((zip:zap) or (fizz:buzz)){$$}');
    });


    it('should optimize away double negations', function() {
        assert.equal(
            crass.parse('@supports not(not(foo:bar)){a{x:y}}').optimize().toString(),
            '@supports (foo:bar){a{x:y}}'
        );
    });
    it('should optimize away duplicate conditions', function() {
        assert.equal(
            crass.parse('@supports not(not(foo:bar)) and (foo:bar){a{x:y}}').optimize().toString(),
            '@supports (foo:bar){a{x:y}}'
        );
    });
    it('should optimize away negated lists of conditions', function() {
        assert.equal(
            crass.parse('@supports not (foo:bar) and not (abc:def) and not (zip:zap) {a{x:y}}').optimize().toString(),
            '@supports not ((foo:bar) or (abc:def) or (zip:zap)){a{x:y}}'
        );
        assert.equal(
            crass.parse('@supports not (foo:bar) or not (abc:def) or not (zip:zap) {a{x:y}}').optimize().toString(),
            '@supports not ((foo:bar) and (abc:def) and (zip:zap)){a{x:y}}'
        );
    });

});
