var assert = require("assert");

var crass = require('../crass');

var filler = 'x:y';
var parseString = function(data) {
    return crass.parse(data).toString();
};
var parseCompare = function(data, expected) {
    data = data.replace(/\$\$/g, filler);
    expected = expected.replace(/\$\$/g, filler);
    assert.equal(parseString(data), expected);
    assert.equal(parseString(crass.parse(data).pretty()), expected);
};
function parity(data) {
    parseCompare(data, data);
}


describe('ID Selectors', function() {
    it('should work', function() {
        parity('#foo{$$}');
        parity('#foo #bar{$$}');
        // Technically won't match anything, but not invalid.
        parity('#foo#bar{$$}');
    });
});

describe('Class Selectors', function() {
    it('should work', function() {
        parity('.foo{$$}');
        parity('.foo .bar{$$}');
        parity('.foo.bar{$$}');
    });
});

describe('Attribute Selectors', function() {
    it('should work', function() {
        parity('[foo]{$$}');
        parity('[foo=bar]{$$}');
        parity('[foo~=bar]{$$}');
    });
    it('should strip quotes when possible', function() {
        parity('[foo=bar]{$$}');
        parity('[foo="ba\\\\r"]{$$}');
        assert.equal(
            crass.parse('[foo="bar"]{a:b}').toString(),
            '[foo=bar]{a:b}'
        )
    });
    it('should allow namespaces', function() {
        parity('[foo|bar]{$$}');
        parity('[foo|bar=bar]{$$}');
    });
});

describe('Pseudo', function() {
    it('elements', function() {
        parity('::after{$$}');
        parity('::after:first-letter{$$}');
        parity('foo::after{$$}');
    });
    it('classes', function() {
        parity(':whatever{$$}');
        parity(':only-child{$$}');
        parity(':only-child:first-child{$$}');
        parity('foo:only-child{$$}');
    });
    it('nth-func', function() {
        parity('foo:nth-child(n){$$}');
        parity('foo:nth-last-child(n){$$}');
        parity('foo:nth-of-type(n){$$}');
        parity('foo:nth-last-of-type(n){$$}');
    });
    it('nth-func syntax', function() {
        parity(':nth-child(2n){$$}');
        parity(':nth-child(2n+1){$$}');
        parity(':nth-child(2n-1){$$}');
        parity(':nth-child(-2n+1){$$}');
        parity(':nth-child(-2n-1){$$}');
        parity(':nth-child(even){$$}');
        parity(':nth-child(odd){$$}');
    });
    it('not', function() {
        parity('foo:not(.foo){$$}');
        parity('foo:not(.foo .bar){$$}');
        parity(':not(:another){$$}');
    });
    it('function', function() {
        parity(':whatever(1em #fff ident){$$}');
        parity(':with-hyphens(1em #fff ident){$$}');
    });
});

describe('Selector Lists', function() {
    it('should output properly', function() {
        parity('a,b,c{$$}');
        parity('.a,#b,c{$$}');
        parity('.a #b,c{$$}');
    });
    it('should pretty print', function() {
        assert.equal(
            crass.parse('a,b,c{foo:bar}').pretty(),
            'a, b, c {\n  foo: bar;\n}\n'
        );
    });
    it('should pretty print with long lines', function() {
        assert.equal(
            crass.parse('thisisareallylongselector, thisisanotherreallylongselector, thisisathirdreallylongselector{foo:bar}').pretty(),
            'thisisareallylongselector,\nthisisanotherreallylongselector,\nthisisathirdreallylongselector {\n  foo: bar;\n}\n'
        );
    });
    it('should pretty print with long lines when indented', function() {
        assert.equal(
            crass.parse(
                '@media (min-width:4){thisisareallylongselector, thisisanotherreallylongselector, thisisathirdreallylongselector{foo:bar}}'
            ).pretty(),
            '@media (min-width: 4) {\n  thisisareallylongselector,\n  thisisanotherreallylongselector,\n  thisisathirdreallylongselector {\n    foo: bar;\n  }\n\n}\n'
        );
    });
});

describe('Selector chains', function() {
    it('can have descendants', function() {
        parity('x y z{$$}');
    });
    it('can have adjacent siblings', function() {
        parseCompare('x + y+z {$$}', 'x+y+z{$$}');
    });
    it('can have direct descendants', function() {
        parseCompare('x > y>z {$$}', 'x>y>z{$$}');
    });
    it('can have siblings', function() {
        parseCompare('x ~ y~z {$$}', 'x~y~z{$$}');
    });
});
