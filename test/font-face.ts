import * as assert from 'assert';

import {parityFilled, optimized} from './_helpers';

describe('@font-face', () => {
  it('should parse font-face blocks', async () => {
    await parityFilled('@font-face{$$}');
  });

  it('should optimize', async () => {
    assert.equal(
      await optimized('@font-face{font-weight:bold}'),
      '@font-face{font-weight:700}',
    );
  });

  describe('support for unicode-range in @font-face blocks', () => {
    it('should parse basic unicode code points', async () => {
      await parityFilled('@font-face{$$;unicode-range:U+123}');
    });
    it('should parse wildcard unicode ranges', async () => {
      await parityFilled('@font-face{$$;unicode-range:U+1??}');
    });
    it('should parse unicode ranges', async () => {
      await parityFilled('@font-face{$$;unicode-range:U+123-fFFf}');
    });
  });
});

describe('@font-feature-values', () => {
  it('should parse each of the inner blocks', async () => {
    await parityFilled('@font-feature-values my font{@swash{$$}}');
    await parityFilled('@font-feature-values my font{@annotation{$$}}');
    await parityFilled('@font-feature-values my font{@ornaments{$$}}');
    await parityFilled('@font-feature-values my font{@stylistic{$$}}');
    await parityFilled('@font-feature-values my font{@styleset{$$}}');
    await parityFilled('@font-feature-values my font{@character-variant{$$}}');
  });

  it('should parse multiple inner blocks', async () => {
    await parityFilled(
      '@font-feature-values my font{@annotation{$$}@swash{$$}}',
    );
  });

  it('should parse FFVs with no inner blocks', async () => {
    await parityFilled('@font-feature-values my font{}');
  });
});
