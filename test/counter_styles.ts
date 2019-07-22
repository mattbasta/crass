import * as assert from 'assert';

import {optimized, parityFilled} from './_helpers';

describe('@counter-styles', () => {
  it('should parse blocks', async () => {
    await parityFilled('@counter-style foo{$$}');
  });
  it('should optimize away empty counter styles', async () => {
    assert.ok(!await optimized('@counter-style foo{}'));
  });

  it('should optimize declarations', async () => {
    assert.equal(
      await optimized('@counter-style foo{a:first;a:first;}', {o1: true}),
      '@counter-style foo{a:first}',
    );
  });
});
