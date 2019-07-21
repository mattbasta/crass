import * as assert from 'assert';

import {optimized} from '../_helpers';

describe('css variables', () => {
  it('should handle variable definitions', async () => {
    assert.equal(await optimized('a{--foo:bar}'), 'a{--foo:bar}');
  });
  it('should handle variable uses', async () => {
    assert.equal(await optimized('a{foo: var(--bar)}'), 'a{foo:var(--bar)}');
    assert.equal(
      await optimized(
        '.wrapper{--border:#000}#navigation div{border:1px solid var(--border)}',
      ),
      '.wrapper{--border:#000}#navigation div{border:1px solid var(--border)}',
    );
  });
});
