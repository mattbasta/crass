import * as assert from 'assert';

import {parityFilled, parity, optimized} from './_helpers';

describe('Lowercase', () => {
  it('descriptors', async () => {
    await parity('b{FOO:bar}', 'b{foo:bar}');
  });
  it('element names', async () => {
    await parity('B{foo:bar}', 'b{foo:bar}');
    await parity('B|FOO{foo:bar}', 'b|foo{foo:bar}');
  });
  it('hex values', async () => {
    await parity('b{foo:#ABCDEF}', 'b{foo:#abcdef}');
  });
  it('short hex values', async () => {
    await parity('b{foo:#ABC}', 'b{foo:#abc}');
  });
  it('pseudo classes', async () => {
    await parity('b:FOO{x:y}', 'b:foo{x:y}');
  });
  it('pseudo elements', async () => {
    await parity('b::FOO{x:y}', 'b::foo{x:y}');
  });
  it('pseudo functions', async () => {
    await parity('b:FOO(bar){x:y}', 'b:foo(bar){x:y}');
  });
  it('attributes', async () => {
    await parity('b[FOO]{x:y}', 'b[foo]{x:y}');
    await parity('b[FOO=bar]{x:y}', 'b[foo=bar]{x:y}');
  });
  it('attributes with namespaces', async () => {
    await parity('b[FOO|BAR]{x:y}', 'b[foo|bar]{x:y}');
    await parity('b[FOO|BAR=bar]{x:y}', 'b[foo|bar=bar]{x:y}');
  });
  it('functions', async () => {
    await parity('b{x:FOO(bar)}', 'b{x:foo(bar)}');
    await parity('b{x:FOO(123,456,789)}', 'b{x:foo(123,456,789)}');
  });
});

describe('Sort', () => {
  it('selector lists', async () => {
    await parity('b,a,d,c{$$}', 'a,b,c,d{$$}');
  });
  it('declarations', async () => {
    await parity('a{c:1;a:2;b:3}', 'a{a:2;b:3;c:1}');
  });
});

describe('Remove', () => {
  it('duplicate declarations', async () => {
    await parity('a{a:1;a:1;a:lol;a:1;b:abc}', 'a{a:1;b:abc}');
    await parity('a{color:#ffffff;color:white}', 'a{color:#fff}');
  });
  it('duplicate selectors in a selector list', async () => {
    await parity('a,a{$$}', 'a{$$}');
    await parity('a b,a b{$$}', 'a b{$$}');
  });
  it('duplicate conditions in a simple selector', async () => {
    await parity('.a.a{$$}', '.a{$$}');
    await parity('a:first-child:first-child{$$}', 'a:first-child{$$}');
  });
  it('empty rulesets', async () => {
    await parity('a{}', '');
  });
  it('empty linear-gradients', async () => {
    await parity('a{background-image:linear-gradient()}', '');
    await parity('a{background-image:-webkit-linear-gradient()}', '');
  });

  describe('overridden declarations', () => {
    it('with a single overrider', async () => {
      await parity('a{font-size:100%;font:inherit}', 'a{font:inherit}');
    });
    it('with multiple overriders', async () => {
      await parity(
        'a{border-bottom-color:#fff;border-color:#000;border:1px solid red}',
        'a{border:1px solid red}',
      );
    });
  });

  describe('unnecessary quadList items', () => {
    it('for groups of four identical items', async () => {
      await parity('b{margin:0 0}', 'b{margin:0}');
      await parity('b{margin:0 0 0 0}', 'b{margin:0}');
      await parity(
        'b{-webkit-border-radius:0 0 0 0}',
        'b{-webkit-border-radius:0}',
      );
    });
    it('for two pairs of identical items', async () => {
      await parity(
        'b{border-width:#fff #000 #fff #000}',
        'b{border-width:#fff #000}',
      );
    });
    it('for identical second and list items', async () => {
      await parity(
        'b{padding:#fff #000 #123 #000}',
        'b{padding:#fff #000 #123}',
      );
    });
    it('for identical first and second items', async () => {
      await parity('b{padding:#fff #fff}', 'b{padding:#fff}');
    });
    it('for identical first and third items', async () => {
      await parity('b{padding:#fff #000 #fff}', 'b{padding:#fff #000}');
    });
    it('except when on an unsupported declaration', async () => {
      await parity('b{foo:0 0 0 0}', 'b{foo:0 0 0 0}');
    });
    it('except when slashes', async () => {
      await parity('b{border-radius:1 0/0 1}', 'b{border-radius:1 0/0 1}');
      await parity('b{border-radius:0 1/0 1}', 'b{border-radius:0 1}');
    });
    it('should collapse border radii', async () => {
      await parity('b{border-radius:0 0/0 0}', 'b{border-radius:0}');
      await parity('b{border-radius:0 1/0 0}', 'b{border-radius:0 1/0}');
      await parity(
        'b{border-radius:0 1 2 1/1 2 1}',
        'b{border-radius:0 1 2/1 2}',
      );
    });
  });

  describe('mismatched browser prefixes', () => {
    it('in keyframes', async () => {
      // Base case
      await parity(
        '@keyframes test{from,to{$$}}',
        '@keyframes test{0%,to{$$}}',
      );

      // Deletes mismatched prefixes
      await parity(
        '@-foo-keyframes test{from,to{a:b;-bar-foo:bar}}',
        '@-foo-keyframes test{0%,to{a:b}}',
      );
    });
  });

  it('should remove invalid keyframes prefixes', async () => {
    await parity('@-ms-keyframes test{from,to{-ms-foo:bar;a:b}}', '');
  });
});

describe('Replace', () => {
  it('nth-selector (2n+1) to (odd)', async () => {
    await parity(':nth-child(2n+1){$$}', ':nth-child(odd){$$}');
  });

  describe('font-weight and font', () => {
    it('normal -> 400', async () => {
      await parity('b{font-weight:normal}', 'b{font-weight:400}');
      await parity('b{font:normal 10px "font"}', 'b{font:400 10px "font"}');
      await parity(
        'b{other:normal 10px "font"}',
        'b{other:normal 10px "font"}',
      );
    });
    it('bold -> 700', async () => {
      await parity('b{font-weight:bold}', 'b{font-weight:700}');
      await parity('b{font:bold 10px "font"}', 'b{font:700 10px "font"}');
      await parity('b{other:bold 10px "font"}', 'b{other:bold 10px "font"}');
    });
  });

  it('none -> 0', async () => {
    await parity('b{border:none}', 'b{border:0}');
    await parity('b{foo:none}', 'b{foo:none}');
  });

  it('*.foo -> .foo', async () => {
    assert.equal(await optimized('*.foo{a:b}', {o1: true}), '.foo{a:b}');
  });

  it('content:none to content: ""', async () => {
    assert.equal(
      await optimized('foo{content:none}', {o1: true}),
      'foo{content:""}',
    );
  });
});

describe('Combine', () => {
  it('identical media queries', async () => {
    await parity('@media screen,screen{a{$$}}', '@media screen{a{$$}}');
    await parity(
      '@media screen and (min-width:1px),screen and (min-width:1px){a{$$}}',
      '@media screen and (min-width:1px){a{$$}}',
    );
  });
  it('keyframes with identical stops', async () => {
    await parity(
      '@keyframes foo{0%{a:b;}0%{c:d;}}',
      '@keyframes foo{0%{a:b;c:d}}',
    );
    // Test that declaration optimization happens after merging.
    await parity('@keyframes foo{0%{a:b;}0%{a:c;}}', '@keyframes foo{0%{a:c}}');
  });
  it('adjacent blocks with similar bodies', async () => {
    await parity('a{x:y}b{x:y}', 'a,b{x:y}');
    await parity('a,b{x:y}a,b{x:y}', 'a,b{x:y}');
    await parity('a{x:y}a,b{x:y}', 'a,b{x:y}');
    await parity('a,b{x:y}a{x:y}', 'a,b{x:y}');
    // Test that siblings are not modified.
    await parity('a{x:y} foo{asdf:qwer} b{x:y}', 'a{x:y}foo{asdf:qwer}b{x:y}');
  });
  it('adjacent blocks with similar selectors', async () => {
    await parity('a{foo:bar}a{def:ghi}', 'a{def:ghi;foo:bar}');
    await parity('a{foo:bar}a{foo:baz}', 'a{foo:baz}');
  });

  it('nearby blocks with identical selectors and intersection', async () => {
    await parity('a{foo:bar}b{x:y}a{foo:zap}', 'b{x:y}a{foo:zap}');
    await parity(
      'a{foo:bar;other:one}b{x:y}a{foo:zap}',
      'a{other:one}b{x:y}a{foo:zap}',
    );
    // Selector may be part of a selector list:
    await parity(
      'a{foo:bar;other:one}b{x:y}a,foo{foo:zap}',
      'a{other:one}b{x:y}a,foo{foo:zap}',
    );
    // Original ruleset's selector may not be part of a selector list:
    await parity(
      'a,xxx{foo:bar;other:one}b{x:y}a{foo:zap}',
      'a,xxx{foo:bar;other:one}b{x:y}a{foo:zap}',
    );
  });
});
