import * as assert from 'assert';

import {parityFilled, optimized, parity, parsed, pretty} from './_helpers';

describe('Element Selectors', () => {
  it('should parse properly', async () => {
    await parityFilled('foo{$$}');
    await parityFilled('foo bar{$$}');
  });
  it('should allow namespaces', async () => {
    await parityFilled('foo|namespace{$$}');
    await parityFilled('|namespace{$$}');
    await parityFilled('foo|namespace bar{$$}');
  });
});

describe('ID Selectors', () => {
  it('should work', async () => {
    await parityFilled('#foo{$$}');
    await parityFilled('#f00{$$}'); // Short hex
    await parityFilled('#f00asdf{$$}'); // Short hex w/ident
    await parityFilled('#f00bad{$$}'); // Long hex
    await parityFilled('#f00badasdf{$$}'); // Long hex w/ident
    await parityFilled('#foo #bar{$$}');
    // Technically won't match anything, but not invalid.
    await parityFilled('#foo#bar{$$}');
    assert.equal(await optimized('#foo{a:b}', {o1: true}), '#foo{a:b}');
  });
});

describe('Class Selectors', () => {
  it('should work', async () => {
    await parityFilled('.foo{$$}');
    await parityFilled('.foo .bar{$$}');
    await parityFilled('.foo.bar{$$}');
    await parityFilled('.foo\\@foo{$$}');
  });
});

describe('Attribute Selectors', () => {
  it('should work', async () => {
    await parityFilled('[foo]{$$}');
    await parityFilled('[foo=bar]{$$}');
    await parityFilled('[foo*=bar]{$$}');
    await parityFilled('[foo|=bar]{$$}');
    await parityFilled('[foo^=bar]{$$}');
    await parityFilled('[foo$=bar]{$$}');
    await parityFilled('[foo~=bar]{$$}');
  });
  it('should strip quotes when possible', async () => {
    await parityFilled('[foo=bar]{$$}');
    assert.equal(parsed('[foo="ba\\\\r"]{a:b}'), '[foo=ba\\\\r]{a:b}');
    assert.equal(parsed('[foo="ba r"]{a:b}'), '[foo="ba r"]{a:b}');
    assert.equal(parsed('[foo="ba   r"]{a:b}'), '[foo="ba   r"]{a:b}');
    assert.equal(parsed('[foo="bar"]{a:b}'), '[foo=bar]{a:b}');
  });
  it('should allow namespaces', async () => {
    await parityFilled('[foo|bar]{$$}');
    await parityFilled('[foo|bar=bar]{$$}');
  });
});

describe('Pseudo', () => {
  it('elements', async () => {
    await parity('::after{a:b;x:y}', ':after{a:b;x:y}');
    await parity(
      '::after:first-letter{a:b;x:y}',
      ':after:first-letter{a:b;x:y}',
    );
    await parity('foo::after{a:b;x:y}', 'foo:after{a:b;x:y}');
  });
  it('classes', async () => {
    await parityFilled(':whatever{$$}');
    await parityFilled(':only-child{$$}');
    await parityFilled(':only-child:first-child{$$}');
    await parityFilled('foo:only-child{$$}');
  });
  it('nth-func', async () => {
    await parityFilled('foo:nth-child(n){$$}');
    await parityFilled('foo:nth-last-child(n){$$}');
    await parityFilled('foo:nth-of-type(n){$$}');
    await parityFilled('foo:nth-last-of-type(n){$$}');

    assert.equal(
      await optimized('foo:nth-child(n){x:y}'),
      'foo:nth-child(n){x:y}',
    );
  });
  it('nth-func syntax', async () => {
    await parityFilled(':nth-child(2n){$$}');
    await parityFilled(':nth-child(2n+1){$$}');
    await parityFilled(':nth-child(2n-1){$$}');
    await parityFilled(':nth-child(-2n+1){$$}');
    await parityFilled(':nth-child(-2n-1){$$}');
    await parityFilled(':nth-child(-2){$$}');
    await parity(':nth-child(+2){a:b;x:y}', ':nth-child(2){a:b;x:y}');
    await parity(':nth-child(0n){a:b;x:y}', ':nth-child(0){a:b;x:y}');
    await parityFilled(':nth-child(even){$$}');
    await parityFilled(':nth-child(odd){$$}');
  });
  it('not', async () => {
    await parityFilled('foo:not(.foo){$$}');
    await parityFilled('foo:not(.foo .bar){$$}');
    await parityFilled(':not(:another){$$}');

    assert.equal(await optimized('foo:not(bar){x:y}'), 'foo:not(bar){x:y}');
  });
  it('function', async () => {
    await parityFilled(':whatever(1em #fff ident){$$}');
    await parityFilled(':with-hyphens(1em #fff ident){$$}');
  });
});

describe('Selector Lists', () => {
  it('should output properly', async () => {
    await parityFilled('a,b,c{$$}');
    await parityFilled('.a,#b,c{$$}');
    await parityFilled('.a #b,c{$$}');
  });
  it('should pretty print', async () => {
    assert.equal(await pretty('a,b,c{foo:bar}'), 'a, b, c {\n  foo: bar;\n}\n');
  });
  it('should pretty print with long lines', async () => {
    assert.equal(
      await pretty(
        'thisisareallylongselector, thisisanotherreallylongselector, thisisathirdreallylongselector{foo:bar}',
      ),
      'thisisareallylongselector,\nthisisanotherreallylongselector,\nthisisathirdreallylongselector {\n  foo: bar;\n}\n',
    );
  });
  it('should pretty print with long lines when indented', async () => {
    assert.equal(
      await pretty(
        '@media (min-width:4){thisisareallylongselector, thisisanotherreallylongselector, thisisathirdreallylongselector{foo:bar}}',
      ),
      '@media (min-width: 4) {\n  thisisareallylongselector,\n  thisisanotherreallylongselector,\n  thisisathirdreallylongselector {\n    foo: bar;\n  }\n\n}\n',
    );
  });
});

describe('Selector chains', () => {
  it('can have descendants', async () => {
    await parityFilled('x y z{$$}');
  });
  it('can have adjacent siblings', async () => {
    await parity('x + y+z {a:b;x:y}', 'x+y+z{a:b;x:y}');
  });
  it('can have direct descendants', async () => {
    await parity('x > y>z {a:b;x:y}', 'x>y>z{a:b;x:y}');
  });
  it('can have siblings', async () => {
    await parity('x ~ y~z {a:b;x:y}', 'x~y~z{a:b;x:y}');
  });
});
