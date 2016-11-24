const assert = require('assert');

const crass = require('../crass');
const parseString = data => crass.parse(data).toString();


describe('Strings', () => {
    it('can be empty', () => {
        assert.equal(parseString('a{content:""}'), 'a{content:""}');
    });
    it('can contain a single char', () => {
        assert.equal(parseString('a{content:"("}'), 'a{content:"("}');
    });
    it('can contain another single char', () => {
        assert.equal(parseString('a{content:"a"}'), 'a{content:"a"}');
    });
    it('can contain escaped quotes', () => {
        assert.equal(parseString('a{content:\'\\\'\'}'), 'a{content:"\'"}');
        assert.equal(parseString('a{content:"\\""}'), 'a{content:\'"\'}');
    });
    it('can contain escaped line breaks', () => {
        assert.equal(parseString('a{content:"\\\n"}'), 'a{content:"\\\n"}');
    });
});


describe('URIs', () => {
    it('can contain data uris', () => {
        assert.equal(
            parseString('a{content:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMTJweCIgeT0iMHB4IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIzcHgiIHZpZXdCb3g9Ij==)}'),
            'a{content:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMTJweCIgeT0iMHB4IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIzcHgiIHZpZXdCb3g9Ij==)}'
        );
    });
    it('can be double quote', () => {
        assert.equal(parseString('a{content:url("foo")}'), 'a{content:url(foo)}');
    });
    it('can be single quote', () => {
        assert.equal(parseString('a{content:url(\'foo\')}'), 'a{content:url(foo)}');
    });
    it('does not optimize', () => {
        assert.equal(crass.parse('a{content:url(\'foo\')}').optimize({o1: true}).toString(), 'a{content:url(foo)}');
    });
    it('can retain quotes', () => {
        assert.equal(parseString('a{content:url("foo)")}'), 'a{content:url("foo)")}');
        assert.equal(parseString('a{content:url(\'foo)\')}'), 'a{content:url("foo)")}');
    });

    it('should normalize URIs on O1', () => {
        const unnormalized = 'a{foo:url(../foo/../bar/./zap)}';
        assert.equal(parseString(unnormalized), unnormalized);
        assert.equal(crass.parse(unnormalized).optimize().toString(), unnormalized);
        assert.equal(crass.parse(unnormalized).optimize({o1: true}).toString(), 'a{foo:url(../bar/zap)}');
    });

});


describe('Numbers', () => {
    it('should omit a leading 0 in negative floating point numbers', () => {
        assert.equal(parseString('a{foo:-0.5}'), 'a{foo:-.5}');
    });
    it('should support scientific notation', () => {
        assert.equal(parseString('a{foo:3e1}'), 'a{foo:30}');
        assert.equal(parseString('a{foo:3e2}'), 'a{foo:300}');
        assert.equal(parseString('a{foo:3e+2}'), 'a{foo:300}');
        assert.equal(parseString('a{foo:3e-2}'), 'a{foo:.03}');
    });
    it('should support unary plus', () => {
        assert.equal(crass.parse('a{foo:+.5}').optimize().toString(), 'a{foo:.5}');
    });
    it('should not optimize', () => {
        assert.equal(crass.parse('a{foo:-.5}').optimize().toString(), 'a{foo:-.5}');
    });
    it('should strip units when the dimension is zero', () => {
        assert.equal(parseString('a{foo:0px}'), 'a{foo:0}');
    });
    it('should not strip units when the dimension is zero percent', () => {
        assert.equal(parseString('a{foo:0%}'), 'a{foo:0%}');
    });
});


describe('Identifiers', () => {
    it('can be normal identifiers', () => {
        assert.equal(parseString('a{foo:bar}'), 'a{foo:bar}');
    });
    it('can be n-resize', () => {
        assert.equal(parseString('a{nearly-cursor:n-resize}'), 'a{nearly-cursor:n-resize}');
    });
    it('can be not-allowed', () => {
        assert.equal(parseString('a{nearly-cursor:not-allowed}'), 'a{nearly-cursor:not-allowed}');
    });
    it('can be use old hacks in declaration names', () => {
        assert.equal(parseString('a{*foo: bar;}'), 'a{*foo:bar}');
    });
});


describe('Expressions', () => {
    it('can be parsed with spaces', () => {
        assert.equal(parseString('a{b:1 2 3}'), 'a{b:1 2 3}');
    });
    it('can be parsed with slashes', () => {
        assert.equal(parseString('a{b:1 2 / 3}'), 'a{b:1 2/3}');
    });
    it('can be parsed with commas', () => {
        assert.equal(parseString('a{b:1 2 , 3}'), 'a{b:1 2,3}');
    });
    it('can contain "to" inside functions', () => {
        assert.equal(parseString('a{b:linear-gradient(to bottom,#65a4e1,#3085d6)}'), 'a{b:linear-gradient(to bottom,#65a4e1,#3085d6)}');
    });

    it('should reduce font names', () => {
        assert.equal(
            crass.parse('a{font-family:"Open Sans","Helvetica",sans-serif;}').optimize().toString(),
            'a{font-family:Open Sans,Helvetica,sans-serif}'
        );
    });
});


describe('Attribute functions', () => {
    it('can contain an attribute name', () => {
        assert.equal(parseString('a{foo:attr(data-foo)}'), 'a{foo:attr(data-foo)}');
    });
    it('can contain an element name with a unit', () => {
        assert.equal(parseString('a{foo:attr(data-foo px)}'), 'a{foo:attr(data-foo px)}');
    });
    it('can contain an element name with a unit with a fallback', () => {
        assert.equal(parseString('a{foo:attr(data-foo px, 123px)}'), 'a{foo:attr(data-foo px,123px)}');
    });
    it('can contain an element name and a fallback without a dimension', () => {
        assert.equal(parseString('a{foo:attr(data-foo, 123px)}'), 'a{foo:attr(data-foo,123px)}');
    });
});


describe('Custom Identifiers', () => {
    it('can be parsed alone', () => {
        assert.equal(parseString('a{b:[foo]}'), 'a{b:[foo]}');
    });
    it('can be parsed in a group', () => {
        assert.equal(parseString('a{b:[foo  bar]}'), 'a{b:[foo bar]}');
    });
});
