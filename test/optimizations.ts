import * as assert from 'assert';


var filler = 'x:y';
var parseString = function(data, kw) {
    return crass.parse(data).optimize(kw || {}).toString();
};
var parseCompare = function(data, expected, kw) {
    data = data.replace(/\$\$/g, filler);
    expected = expected.replace(/\$\$/g, filler);
    if (kw) {
        if (kw.o1 && data !== expected) {
            assert.notEqual(parseString(data), expected);
        }
        assert.equal(parseString(data, kw), expected);
        assert.equal(parseString(crass.parse(data).pretty(), kw), expected);
    } else {
        assert.equal(parseString(data), expected);
    }
};


describe('Lowercase', () => {
    it('descriptors', () => {
        parseCompare('b{FOO:bar}', 'b{foo:bar}');
    });
    it('element names', () => {
        parseCompare('B{foo:bar}', 'b{foo:bar}');
        parseCompare('B|FOO{foo:bar}', 'b|foo{foo:bar}');
    });
    it('hex values', () => {
        parseCompare('b{foo:#ABCDEF}', 'b{foo:#abcdef}');
    });
    it('short hex values', () => {
        parseCompare('b{foo:#ABC}', 'b{foo:#abc}');
    });
    it('pseudo classes', () => {
        parseCompare('b:FOO{x:y}', 'b:foo{x:y}');
    });
    it('pseudo elements', () => {
        parseCompare('b::FOO{x:y}', 'b::foo{x:y}');
    });
    it('pseudo functions', () => {
        parseCompare('b:FOO(bar){x:y}', 'b:foo(bar){x:y}');
    });
    it('attributes', () => {
        parseCompare('b[FOO]{x:y}', 'b[foo]{x:y}');
        parseCompare('b[FOO=bar]{x:y}', 'b[foo=bar]{x:y}');
    });
    it('attributes with namespaces', () => {
        parseCompare('b[FOO|BAR]{x:y}', 'b[foo|bar]{x:y}');
        parseCompare('b[FOO|BAR=bar]{x:y}', 'b[foo|bar=bar]{x:y}');
    });
    it('functions', () => {
        parseCompare('b{x:FOO(bar)}', 'b{x:foo(bar)}');
        parseCompare('b{x:FOO(123,456,789)}', 'b{x:foo(123,456,789)}');
    });
});

describe('Sort', () => {
    it('selector lists', () => {
        parseCompare('b,a,d,c{$$}', 'a,b,c,d{$$}');
    });
    it('declarations', () => {
        parseCompare('a{c:1;a:2;b:3}', 'a{a:2;b:3;c:1}');
    });
});

describe('Remove', () => {
    it('duplicate declarations', () => {
        parseCompare('a{a:1;a:1;a:lol;a:1;b:abc}', 'a{a:1;b:abc}');
        parseCompare('a{color:#ffffff;color:white}', 'a{color:#fff}');
    });
    it('duplicate selectors in a selector list', () => {
        parseCompare('a,a{$$}', 'a{$$}');
        parseCompare('a b,a b{$$}', 'a b{$$}');
    });
    it('duplicate conditions in a simple selector', () => {
        parseCompare('.a.a{$$}', '.a{$$}');
        parseCompare('a:first-child:first-child{$$}', 'a:first-child{$$}');
    });
    it('empty rulesets', () => {
        parseCompare('a{}', '');
    });
    it('empty linear-gradients', () => {
        parseCompare('a{background-image:linear-gradient()}', '');
        parseCompare('a{background-image:-webkit-linear-gradient()}', '');
    });

    describe('overridden declarations', () => {
        it('with a single overrider', () => {
            parseCompare('a{font-size:100%;font:inherit}', 'a{font:inherit}');
        });
        it('with multiple overriders', () => {
            parseCompare('a{border-bottom-color:#fff;border-color:#000;border:1px solid red}', 'a{border:1px solid red}');
        });
    });


    describe('unnecessary quadList items', () => {
        it('for groups of four identical items', () => {
            parseCompare(
                'b{margin:0 0}',
                'b{margin:0}'
            );
            parseCompare(
                'b{margin:0 0 0 0}',
                'b{margin:0}'
            );
            parseCompare(
                'b{-webkit-border-radius:0 0 0 0}',
                'b{-webkit-border-radius:0}'
            );
        });
        it('for two pairs of identical items', () => {
            parseCompare(
                'b{border-width:#fff #000 #fff #000}',
                'b{border-width:#fff #000}'
            );
        });
        it('for identical second and list items', () => {
            parseCompare(
                'b{padding:#fff #000 #123 #000}',
                'b{padding:#fff #000 #123}'
            );
        });
        it('for identical first and second items', () => {
            parseCompare(
                'b{padding:#fff #fff}',
                'b{padding:#fff}'
            );
        });
        it('for identical first and third items', () => {
            parseCompare(
                'b{padding:#fff #000 #fff}',
                'b{padding:#fff #000}'
            );
        });
        it('except when on an unsupported declaration', () => {
            parseCompare(
                'b{foo:0 0 0 0}',
                'b{foo:0 0 0 0}'
            );
        });
        it('except when slashes', () => {
            parseCompare(
                'b{border-radius:1 0/0 1}',
                'b{border-radius:1 0/0 1}'
            );
            parseCompare(
                'b{border-radius:0 1/0 1}',
                'b{border-radius:0 1}'
            );
        });
        it('should collapse border radii', () => {
            parseCompare(
                'b{border-radius:0 0/0 0}',
                'b{border-radius:0}'
            );
            parseCompare(
                'b{border-radius:0 1/0 0}',
                'b{border-radius:0 1/0}'
            );
            parseCompare(
                'b{border-radius:0 1 2 1/1 2 1}',
                'b{border-radius:0 1 2/1 2}'
            );
        });
    });

    describe('mismatched browser prefixes', () => {
        it('in keyframes', () => {
            // Base case
            parseCompare(
                '@keyframes test{from,to{$$}}',
                '@keyframes test{0%,to{$$}}'
            );

            // Deletes mismatched prefixes
            parseCompare(
                '@-foo-keyframes test{from,to{a:b;-bar-foo:bar}}',
                '@-foo-keyframes test{0%,to{a:b}}'
            );
        });
    });

    it('should remove invalid keyframes prefixes', () => {
        parseCompare(
            '@-ms-keyframes test{from,to{-ms-foo:bar;a:b}}',
            ''
        );
    });
});

describe('Replace', () => {
    it('nth-selector (2n+1) to (odd)', () => {
        parseCompare(':nth-child(2n+1){$$}', ':nth-child(odd){$$}');
    });

    describe('font-weight and font', () => {
        it('normal -> 400', () => {
            parseCompare('b{font-weight:normal}', 'b{font-weight:400}');
            parseCompare('b{font:normal 10px "font"}', 'b{font:400 10px "font"}');
            parseCompare('b{other:normal 10px "font"}', 'b{other:normal 10px "font"}');
        });
        it('bold -> 700', () => {
            parseCompare('b{font-weight:bold}', 'b{font-weight:700}');
            parseCompare('b{font:bold 10px "font"}', 'b{font:700 10px "font"}');
            parseCompare('b{other:bold 10px "font"}', 'b{other:bold 10px "font"}');
        });
    });

    it('none -> 0', () => {
        parseCompare('b{border:none}', 'b{border:0}');
        parseCompare('b{foo:none}', 'b{foo:none}');
    });

    it('*.foo -> .foo', () => {
        parseCompare('*.foo{$$}', '.foo{$$}', {o1: true});
    });

    it('content:none to content: ""', () => {
        parseCompare('foo{content:none}', 'foo{content:""}', {o1: true});
    });
});

describe('Combine', () => {
    it('identical media queries', () => {
        parseCompare('@media screen,screen{a{$$}}', '@media screen{a{$$}}');
        parseCompare('@media screen and (min-width:1px),screen and (min-width:1px){a{$$}}',
                     '@media screen and (min-width:1px){a{$$}}');
    });
    it('keyframes with identical stops', () => {
        parseCompare('@keyframes foo{0%{a:b;}0%{c:d;}}',
                     '@keyframes foo{0%{a:b;c:d}}');
        // Test that declaration optimization happens after merging.
        parseCompare('@keyframes foo{0%{a:b;}0%{a:c;}}',
                     '@keyframes foo{0%{a:c}}');
    });
    it('adjacent blocks with similar bodies', () => {
        parseCompare('a{x:y}b{x:y}', 'a,b{x:y}');
        parseCompare('a,b{x:y}a,b{x:y}', 'a,b{x:y}');
        parseCompare('a{x:y}a,b{x:y}', 'a,b{x:y}');
        parseCompare('a,b{x:y}a{x:y}', 'a,b{x:y}');
        // Test that siblings are not modified.
        parseCompare('a{x:y} foo{asdf:qwer} b{x:y}', 'a{x:y}foo{asdf:qwer}b{x:y}');
    });
    it('adjacent blocks with similar selectors', () => {
        parseCompare('a{foo:bar}a{def:ghi}', 'a{def:ghi;foo:bar}');
        parseCompare('a{foo:bar}a{foo:baz}', 'a{foo:baz}');
    });

    it('nearby blocks with identical selectors and intersection', () => {
        parseCompare('a{foo:bar}b{x:y}a{foo:zap}', 'b{x:y}a{foo:zap}');
        parseCompare('a{foo:bar;other:one}b{x:y}a{foo:zap}', 'a{other:one}b{x:y}a{foo:zap}');
        // Selector may be part of a selector list:
        parseCompare('a{foo:bar;other:one}b{x:y}a,foo{foo:zap}', 'a{other:one}b{x:y}a,foo{foo:zap}');
        // Original ruleset's selector may not be part of a selector list:
        parseCompare('a,xxx{foo:bar;other:one}b{x:y}a{foo:zap}', 'a,xxx{foo:bar;other:one}b{x:y}a{foo:zap}');
    });
});
