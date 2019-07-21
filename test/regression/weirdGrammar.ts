import * as assert from 'assert';

import {optimized} from '../_helpers';

describe('weird grammar regressions', () => {
  it('should handle escaped identifiers', async () => {
    assert.equal(await optimized('.\\31 0\\+{x:y}'), '.\\31 0\\+{x:y}');
  });
});
