var assert = require("assert");

var crass = require('../crass');

var filler = 'x:y';
var parseString = function(data) {
    return crass.parse(data).optimize().toString();
};
var parseCompare = function(data, expected) {
    data = data.replace(/\$\$/g, filler);
    expected = expected.replace(/\$\$/g, filler);
    assert.equal(parseString(data), expected);
};


describe('Lowercase', function() {
    it('descriptors', function() {
        parseCompare('b{FOO:bar}', 'b{foo:bar}');
    });
    it('element names', function() {
        parseCompare('B{foo:bar}', 'b{foo:bar}');
        parseCompare('B|FOO{foo:bar}', 'b|foo{foo:bar}');
    });
    it('hex values', function() {
        parseCompare('b{foo:#ABCDEF}', 'b{foo:#abcdef}');
    });
    it('short hex values', function() {
        parseCompare('b{foo:#ABC}', 'b{foo:#abc}');
    });
    it('pseudo classes', function() {
        parseCompare('b:FOO{x:y}', 'b:foo{x:y}');
    });
    it('pseudo elements', function() {
        parseCompare('b::FOO{x:y}', 'b::foo{x:y}');
    });
    it('pseudo functions', function() {
        parseCompare('b:FOO(bar){x:y}', 'b:foo(bar){x:y}');
    });
    it('attributes', function() {
        parseCompare('b[FOO]{x:y}', 'b[foo]{x:y}');
        parseCompare('b[FOO=bar]{x:y}', 'b[foo=bar]{x:y}');
    });
    it('attributes with namespaces', function() {
        parseCompare('b[FOO|BAR]{x:y}', 'b[foo|bar]{x:y}');
        parseCompare('b[FOO|BAR=bar]{x:y}', 'b[foo|bar=bar]{x:y}');
    });
    it('dimensions', function() {
        parseCompare('b{x:4EM}', 'b{x:4em}');
    });
    it('functions', function() {
        parseCompare('b{x:FOO(bar)}', 'b{x:foo(bar)}');
    });
});

describe('Sort', function() {
    it('selector lists', function() {
        parseCompare('b,a,d,c{$$}', 'a,b,c,d{$$}');
    });
    it('declarations', function() {
        parseCompare('a{c:1;a:2;b:3}', 'a{a:2;b:3;c:1}');
    });
});

describe('Remove', function() {
    it('duplicate declarations', function() {
        parseCompare('a{a:1;a:foo;a:lol;a:2;b:abc}', 'a{a:2;b:abc}');
    });

    describe('unnecessary quadList items', function() {
        it('for groups of four identical items', function() {
            parseCompare(
                'b{margin:0 0 0 0}',
                'b{margin:0}'
            );
        });
        it('for two pairs of identical items', function() {
            parseCompare(
                'b{border-width:#fff #000 #fff #000}',
                'b{border-width:#fff #000}'
            );
        });
        it('for identical second and list items', function() {
            parseCompare(
                'b{padding:#fff #000 #123 #000}',
                'b{padding:#fff #000 #123}'
            );
        });
        it('except when on an unsupported declaration', function() {
            parseCompare(
                'b{foo:0 0 0 0}',
                'b{foo:0 0 0 0}'
            );
        });
    });
});

describe('Replace', function() {
    it('nth-selector (2n+1) to (odd)', function() {
        parseCompare(':nth-child(2n+1){$$}', ':nth-child(odd){$$}');
    });

    describe('colors', function() {
        it('long hex to short hex', function() {
            parseCompare(
                'b{color:#ffffff}',
                'b{color:#fff}'
            );
            parseCompare(
                'b{color:rgb(0,0,0)}',
                'b{color:#000}'
            );
        });

        it('rgb with short hex', function() {
            parseCompare(
                'b{color:rgb(255,255,255)}',
                'b{color:#fff}'
            );
            parseCompare(
                'b{color:rgb(0,0,0)}',
                'b{color:#000}'
            );
        });
        it('rgb with long hex', function() {
            parseCompare(
                'b{color:rgb(255,255,254)}',
                'b{color:#fffffe}'
            );
        });

        it('hsl with short hex', function() {
            parseCompare(
                'b{color:hsl(0,0%,100%)}',
                'b{color:#fff}'
            );
            parseCompare(
                'b{color:hsl(0,100%,50%)}',
                'b{color:#f00}'
            );
        });
        it('hsl with long hex', function() {
            parseCompare(
                'b{color:hsl(1,100%,50%)}',
                'b{color:#ff0400}'
            );
        });

        it('rgba with hsla', function() {
            parseCompare(
                'b{color:rgba(255,255,255,.1)}',
                'b{color:hsla(0,0%,100%,.1)}'
            );
        });
    });

    describe('font-weight and font', function() {
        it('normal -> 400', function() {
            parseCompare('b{font-weight:normal}', 'b{font-weight:400}');
            parseCompare('b{font:normal 10px "font"}', 'b{font:400 10px "font"}');
            parseCompare('b{other:normal 10px "font"}', 'b{other:normal 10px "font"}');
        });
        it('bold -> 700', function() {
            parseCompare('b{font-weight:bold}', 'b{font-weight:700}');
            parseCompare('b{font:bold 10px "font"}', 'b{font:700 10px "font"}');
            parseCompare('b{other:bold 10px "font"}', 'b{other:bold 10px "font"}');
        });
    });

    it('none -> 0', function() {
        parseCompare('b{border:none}', 'b{border:0}');
        parseCompare('b{foo:none}', 'b{foo:none}');
    });
});
