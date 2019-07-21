import * as assert from 'assert';
const crass = require('../src');

const filler = 'x:y';
const parseString = (data) => {
    return crass.parse(data).toString();
};
const parseCompare = (data, expected) => {
    data = data.replace(/\$\$/g, filler);
    expected = expected.replace(/\$\$/g, filler);
    assert.equal(parseString(data), expected);
    assert.equal(parseString(crass.parse(data).pretty()), expected);
};
function parity(data, comp) {
    parseCompare(data, comp || data);
}


describe('Element Selectors', () => {
    it('should parse properly', () => {
        parity('foo{$$}');
        parity('foo bar{$$}');
    });
    it('should allow namespaces', () => {
        parity('foo|namespace{$$}');
        parity('|namespace{$$}');
        parity('foo|namespace bar{$$}');
    });
});

describe('ID Selectors', () => {
    it('should work', () => {
        parity('#foo{$$}');
        parity('#f00{$$}'); // Short hex
        parity('#f00asdf{$$}'); // Short hex w/ident
        parity('#f00bad{$$}'); // Long hex
        parity('#f00badasdf{$$}'); // Long hex w/ident
        parity('#foo #bar{$$}');
        // Technically won't match anything, but not invalid.
        parity('#foo#bar{$$}');
        assert.equal(
            crass.parse('#foo{a:b}').optimize({o1: true}).toString(),
            '#foo{a:b}'
        );
    });
});

describe('Class Selectors', () => {
    it('should work', () => {
        parity('.foo{$$}');
        parity('.foo .bar{$$}');
        parity('.foo.bar{$$}');
        parity('.foo\\@foo{$$}');
    });
});

describe('Attribute Selectors', () => {
    it('should work', () => {
        parity('[foo]{$$}');
        parity('[foo=bar]{$$}');
        parity('[foo*=bar]{$$}');
        parity('[foo|=bar]{$$}');
        parity('[foo^=bar]{$$}');
        parity('[foo$=bar]{$$}');
        parity('[foo~=bar]{$$}');
    });
    it('should strip quotes when possible', () => {
        parity('[foo=bar]{$$}');
        assert.equal(
            crass.parse('[foo="ba\\\\r"]{a:b}').toString(),
            '[foo=ba\\\\r]{a:b}'
        );
        assert.equal(
            crass.parse('[foo="ba r"]{a:b}').toString(),
            '[foo="ba r"]{a:b}'
        );
        assert.equal(
            crass.parse('[foo="ba   r"]{a:b}').toString(),
            '[foo="ba   r"]{a:b}'
        );
        assert.equal(
            crass.parse('[foo="bar"]{a:b}').toString(),
            '[foo=bar]{a:b}'
        );
    });
    it('should allow namespaces', () => {
        parity('[foo|bar]{$$}');
        parity('[foo|bar=bar]{$$}');
    });
});

describe('Pseudo', () => {
    it('elements', () => {
        parseCompare('::after{$$}', ':after{$$}');
        parseCompare('::after:first-letter{$$}', ':after:first-letter{$$}');
        parseCompare('foo::after{$$}', 'foo:after{$$}');
    });
    it('classes', () => {
        parity(':whatever{$$}');
        parity(':only-child{$$}');
        parity(':only-child:first-child{$$}');
        parity('foo:only-child{$$}');
    });
    it('nth-func', () => {
        parity('foo:nth-child(n){$$}');
        parity('foo:nth-last-child(n){$$}');
        parity('foo:nth-of-type(n){$$}');
        parity('foo:nth-last-of-type(n){$$}');

        assert.equal(
            crass.parse('foo:nth-child(n){x:y}').optimize().toString(),
            'foo:nth-child(n){x:y}'
        );
    });
    it('nth-func syntax', () => {
        parity(':nth-child(2n){$$}');
        parity(':nth-child(2n+1){$$}');
        parity(':nth-child(2n-1){$$}');
        parity(':nth-child(-2n+1){$$}');
        parity(':nth-child(-2n-1){$$}');
        parity(':nth-child(-2){$$}');
        parity(':nth-child(+2){$$}', ':nth-child(2){$$}');
        parity(':nth-child(0n){$$}', ':nth-child(0){$$}');
        parity(':nth-child(even){$$}');
        parity(':nth-child(odd){$$}');
    });
    it('not', () => {
        parity('foo:not(.foo){$$}');
        parity('foo:not(.foo .bar){$$}');
        parity(':not(:another){$$}');

        assert.equal(
            crass.parse('foo:not(bar){x:y}').optimize().toString(),
            'foo:not(bar){x:y}'
        );
    });
    it('function', () => {
        parity(':whatever(1em #fff ident){$$}');
        parity(':with-hyphens(1em #fff ident){$$}');
    });
});

describe('Selector Lists', () => {
    it('should output properly', () => {
        parity('a,b,c{$$}');
        parity('.a,#b,c{$$}');
        parity('.a #b,c{$$}');
    });
    it('should pretty print', () => {
        assert.equal(
            crass.parse('a,b,c{foo:bar}').pretty(),
            'a, b, c {\n  foo: bar;\n}\n'
        );
    });
    it('should pretty print with long lines', () => {
        assert.equal(
            crass.parse('thisisareallylongselector, thisisanotherreallylongselector, thisisathirdreallylongselector{foo:bar}').pretty(),
            'thisisareallylongselector,\nthisisanotherreallylongselector,\nthisisathirdreallylongselector {\n  foo: bar;\n}\n'
        );
    });
    it('should pretty print with long lines when indented', () => {
        assert.equal(
            crass.parse(
                '@media (min-width:4){thisisareallylongselector, thisisanotherreallylongselector, thisisathirdreallylongselector{foo:bar}}'
            ).pretty(),
            '@media (min-width: 4) {\n  thisisareallylongselector,\n  thisisanotherreallylongselector,\n  thisisathirdreallylongselector {\n    foo: bar;\n  }\n\n}\n'
        );
    });
});

describe('Selector chains', () => {
    it('can have descendants', () => {
        parity('x y z{$$}');
    });
    it('can have adjacent siblings', () => {
        parseCompare('x + y+z {$$}', 'x+y+z{$$}');
    });
    it('can have direct descendants', () => {
        parseCompare('x > y>z {$$}', 'x>y>z{$$}');
    });
    it('can have siblings', () => {
        parseCompare('x ~ y~z {$$}', 'x~y~z{$$}');
    });
});
