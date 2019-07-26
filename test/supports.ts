import * as assert from 'assert';

import {parityFilled, parse, optimized} from './_helpers';

const filler = '.foo{x:y}';
const parity = async (data: string) => parityFilled(data, filler);

describe('@supports', () => {
  it('should parse basic supports block', () => {
    const parsed = parse('@supports (foo: bar) {a{x:y}}');
    assert.equal(parsed.content.length, 1);
    assert(parsed.content[0].conditionList);

    assert.equal(parsed.toString(), '@supports (foo:bar){a{x:y}}');
  });
  it('should parse supports block with parens in declaration', async () => {
    await parity('@supports (foo:"(asdf)" rotate(.1deg)){$$}');
  });
  it('should parse supports block with negation', async () => {
    await parity('@supports not (foo:bar){$$}');
  });
  it('should parse supports block with or combination', async () => {
    await parity('@supports (foo:bar) or (zip:zap) or (fizz:buzz){$$}');
  });
  it('should parse supports block with and combination', async () => {
    await parity('@supports (foo:bar) and (zip:zap) and (fizz:buzz){$$}');
  });
  it('should parse supports block with combination and negation', async () => {
    await parity('@supports (foo:bar) and not (zip:zap) and (fizz:buzz){$$}');
  });
  it('should parse supports block with multiple combinations', async () => {
    await parity('@supports (foo:bar) and ((zip:zap) or (fizz:buzz)){$$}');
  });
  it('should parse supports block with negated combinations', async () => {
    await parity('@supports (foo:bar) and not ((zip:zap) or (fizz:buzz)){$$}');
  });

  it('should optimize away double negations', async () => {
    assert.equal(
      await optimized('@supports not(not(foo:bar)){a{x:y}}'),
      '@supports (foo:bar){a{x:y}}',
    );
  });
  it('should optimize away duplicate conditions', async () => {
    assert.equal(
      await optimized('@supports not(not(foo:bar)) and (foo:bar){a{x:y}}'),
      '@supports (foo:bar){a{x:y}}',
    );
  });
  it('should optimize away negated lists of conditions', async () => {
    assert.equal(
      await optimized(
        '@supports not (foo:bar) and not (abc:def) and not (zip:zap) {a{x:y}}',
      ),
      '@supports not ((foo:bar) or (abc:def) or (zip:zap)){a{x:y}}',
    );
    assert.equal(
      await optimized(
        '@supports not (foo:bar) or not (abc:def) or not (zip:zap) {a{x:y}}',
      ),
      '@supports not ((foo:bar) and (abc:def) and (zip:zap)){a{x:y}}',
    );
  });
});
