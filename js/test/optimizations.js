var assert = require("assert");

var crass = require('../crass');

var filler = 'x:y';
var parseString = function(data, kw) {
    return crass.parse(data).optimize(kw).toString();
};
var parseCompare = function(data, expected, o1) {
    data = data.replace(/\$\$/g, filler);
    expected = expected.replace(/\$\$/g, filler);
    if (o1) {
        assert.notEqual(parseString(data), expected);
        assert.equal(parseString(data, {o1: true}), expected);
    } else {
        assert.equal(parseString(data), expected);
    }
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
    it('duplicate selectors in a selector list', function() {
        parseCompare('a,a{$$}', 'a{$$}');
        parseCompare('a b,a b{$$}', 'a b{$$}');
    });
    it('duplicate conditions in a simple selector', function() {
        parseCompare('.a.a{$$}', '.a{$$}');
        parseCompare('a:first-child:first-child{$$}', 'a:first-child{$$}');
    });
    it('empty rulesets', function() {
        parseCompare('a{}', '');
    });

    describe('unnecessary quadList items', function() {
        it('for groups of four identical items', function() {
            parseCompare(
                'b{margin:0 0 0 0}',
                'b{margin:0}'
            );
            parseCompare(
                'b{-webkit-border-radius:0 0 0 0}',
                'b{-webkit-border-radius:0}'
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

    describe('mismatched browser prefixes', function() {
        it('in keyframes', function() {
            // Base case
            parseCompare(
                '@keyframes test{from,to{$$}}',
                '@keyframes test{from,to{$$}}'
            );

            // Deletes mismatched prefixes
            parseCompare(
                '@-ms-keyframes test{from,to{a:b;-webkit-foo:bar}}',
                '@-ms-keyframes test{from,to{a:b}}'
            );
            // Preserves matching prefixes
            parseCompare(
                '@-ms-keyframes test{from,to{-ms-foo:bar;a:b}}',
                '@-ms-keyframes test{from,to{-ms-foo:bar;a:b}}'
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

    it('*.foo -> .foo', function() {
        parseCompare('*.foo{$$}', '.foo{$$}', true);
    });

    it('*, .foo -> *', function() {
        parseCompare('*,.foo{$$}', '*{$$}', true);
    });
});

describe('Combine', function() {
    it('identical media queries', function() {
        parseCompare('@media screen,screen{a{$$}}', '@media screen{a{$$}}');
        parseCompare('@media screen and (min-width:1px),screen and (min-width:1px){a{$$}}',
                     '@media screen and (min-width:1px){a{$$}}');
    });
    it('keyframes with identical stops', function() {
        parseCompare('@keyframes foo{0%{a:b;}0%{c:d;}}',
                     '@keyframes foo{0%{a:b;c:d}}');
        // Test that declaration optimization happens after merging.
        parseCompare('@keyframes foo{0%{a:b;}0%{a:c;}}',
                     '@keyframes foo{0%{a:c}}');
    });
});
