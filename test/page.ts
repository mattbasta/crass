import * as assert from 'assert';

import {parityFilled, optimized} from './_helpers';

describe('@page', () => {
  it('should parse pages', async () => {
    await parityFilled('@page :first{$$}');
    await parityFilled('@page :first{$$;}', '@page :first{x:y}');
    await parityFilled('@page :first{$$;a:b}');
  });
  it('should parse empty pages', async () => {
    await parityFilled('@page :first{}');
  });

  it('should parse pages with margins', async () => {
    await parityFilled('@page :first{$$;@top-right{$$}}');
    await parityFilled('@page :first{$$;@top-right{$$}a:b}');
  });

  it('should optimize page declarations', async () => {
    assert.equal(
      await optimized('@page :first {width: 12pt}'),
      '@page :first{width:1pc}',
    );
  });
  it('should optimize page declarations with margins', async () => {
    assert.equal(
      await optimized('@page :first {@top-right{width:12pt}}'),
      '@page :first{@top-right{width:1pc}}',
    );
  });
});
