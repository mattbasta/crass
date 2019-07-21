import * as assert from 'assert';

import {optimized} from '../_helpers';

describe('filters', () => {
  it('should handle semantic ui CSS filters', async () => {
    assert.equal(
      await optimized('.selector{filter:blur(5px) grayscale(0.7)}'),
      '.selector{filter:blur(5px) grayscale(.7)}',
    );
  });
});
