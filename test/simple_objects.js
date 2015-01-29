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


describe('URIs', function() {
    it('can contain data uris', function() {
        assert.equal(
            parseString('a{content:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMTJweCIgeT0iMHB4IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIzcHgiIHZpZXdCb3g9Ij==)}'),
            'a{content:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMTJweCIgeT0iMHB4IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIzcHgiIHZpZXdCb3g9Ij==)}'
        );
    });
    it('can be double quote', function() {
        assert.equal(parseString('a{content:url("foo")}'), 'a{content:url(foo)}');
    });
    it('can be single quote', function() {
        assert.equal(parseString('a{content:url(\'foo\')}'), 'a{content:url(foo)}');
    });
    it('does not optimize', function() {
        assert.equal(crass.parse('a{content:url(\'foo\')}').optimize({o1: true}).toString(), 'a{content:url(foo)}');
    });
    it('can retain quotes', function() {
        assert.equal(parseString('a{content:url("foo)")}'), 'a{content:url("foo)")}');
        assert.equal(parseString('a{content:url(\'foo)\')}'), 'a{content:url("foo)")}');
    });
});


describe('Numbers', function() {
    it('should omit a leading 0 in negative floating point numbers', function() {
        assert.equal(parseString('a{foo:-0.5}'), 'a{foo:-.5}');
    });
    it('should support scientific notation', function() {
        assert.equal(crass.parse('a{foo:3e1}').toString(), 'a{foo:30}');
        assert.equal(crass.parse('a{foo:3e2}').toString(), 'a{foo:300}');
        assert.equal(crass.parse('a{foo:3e+2}').toString(), 'a{foo:300}');
        assert.equal(crass.parse('a{foo:3e-2}').toString(), 'a{foo:.03}');
    });
    it('should support unary plus', function() {
        assert.equal(crass.parse('a{foo:+.5}').optimize().toString(), 'a{foo:.5}');
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


describe('Expressions', function() {
    it('can be parsed with spaces', function() {
        assert.equal(parseString('a{b:1 2 3}'), 'a{b:1 2 3}');
    });
    it('can be parsed with slashes', function() {
        assert.equal(parseString('a{b:1 2 / 3}'), 'a{b:1 2/3}');
    });
    it('can be parsed with commas', function() {
        assert.equal(parseString('a{b:1 2 , 3}'), 'a{b:1 2,3}');
    });
    it('can contain "to" inside functions', function() {
        assert.equal(parseString('a{b:linear-gradient(to bottom,#65a4e1,#3085d6)}'), 'a{b:linear-gradient(to bottom,#65a4e1,#3085d6)}');
    });
});


describe('Attribute functions', function() {
    it('can contain an attribute name', function() {
        assert.equal(parseString('a{foo:attr(data-foo)}'), 'a{foo:attr(data-foo)}');
    });
    it('can contain an element name with a unit', function() {
        assert.equal(parseString('a{foo:attr(data-foo px)}'), 'a{foo:attr(data-foo px)}');
    });
    it('can contain an element name with a unit with a fallback', function() {
        assert.equal(parseString('a{foo:attr(data-foo px, 123px)}'), 'a{foo:attr(data-foo px,123px)}');
    });
    it('can contain an element name and a fallback without a dimension', function() {
        assert.equal(parseString('a{foo:attr(data-foo, 123px)}'), 'a{foo:attr(data-foo,123px)}');
    });
});
