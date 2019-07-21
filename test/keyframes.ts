import * as assert from 'assert';

import {parityFilled, optimized} from './_helpers';

const filler = 'from{x:y}to{a:b}';
const parity = async (data: string) => parityFilled(data, filler);

describe('@keyframes', () => {
  it('should parse keyframes blocks', async () => {
    await parity('@keyframes foo{$$}');
  });

  it('should parse keyframes blocks with a prefix', async () => {
    await parity('@-webkit-keyframes foo{$$}');
  });

  it('should throw errors when a number has no unit and it is not zero', async () => {
    assert.throws(async () => {
      await parity('@-webkit-keyframes foo{123{a:b}}');
    }, Error);
  });

  it('should parse keyframe selectors', async () => {
    await parity('@-webkit-keyframes foo{0%{a:b}to{c:d}}');
  });

  it('should parse multiple keyframe selectors', async () => {
    await parity('@-webkit-keyframes foo{0,100%{c:d}}');
  });

  it('should optimize keyframe contents', async () => {
    assert.equal(
      await optimized(
        '@-webkit-keyframes foo{to{bbb:foo;aaa:bar;}from{ccc:zip;ddd:zap}}',
      ),
      '@-webkit-keyframes foo{0%{ccc:zip;ddd:zap}to{aaa:bar;bbb:foo}}',
    );
  });

  it('should optimize keyframe selectors', async () => {
    assert.equal(
      await optimized('@-webkit-keyframes foo{0%{a:b}100%{c:d}}'),
      '@-webkit-keyframes foo{0%{a:b}to{c:d}}',
    );
  });

  it('should dedupe selectors', async () => {
    assert.equal(
      await optimized('@-webkit-keyframes foo{0%{a:b}50%{a:b}100%{c:d}}', {
        o1: true,
      }),
      '@-webkit-keyframes foo{0%,50%{a:b}to{c:d}}',
    );
  });

  it('should remove unprefixed transforms from prefixed keyframes', async () => {
    assert.equal(
      await optimized(
        '@-webkit-keyframes foo{0%{-webkit-transform:x;transform:x}to{-webkit-transform:y;transform:y}}',
        {o1: true},
      ),
      '@-webkit-keyframes foo{0%{-webkit-transform:x}to{-webkit-transform:y}}',
    );
  });

  it('should remove prefixed transforms from unprefixed keyframes only when the prefixed keyframes block exists', async () => {
    assert.equal(
      await optimized(
        '@-webkit-keyframes foo{0%{a:b}}@keyframes foo{0%{-webkit-transform:a;transform:b}}',
        {o1: true},
      ),
      '@-webkit-keyframes foo{0%{a:b}}@keyframes foo{0%{transform:b}}',
    );
    assert.equal(
      await optimized(
        '@-webkit-keyframes bar{0%{a:b}}@keyframes foo{0%{-webkit-transform:a;transform:b}}',
        {o1: true},
      ),
      '@-webkit-keyframes bar{0%{a:b}}@keyframes foo{0%{-webkit-transform:a;transform:b}}',
    );
  });
});
