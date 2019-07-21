import * as assert from 'assert';

import {optimized} from '../_helpers';

describe('font-family', () => {
  it('should strip quotes', async () => {
    assert.equal(
      await optimized('a{font-family:"Roboto Sans",sans-serif}'),
      'a{font-family:Roboto Sans,sans-serif}',
    );
  });
  it('should not strip quotes on fonts with keywords in the name', async () => {
    assert.equal(
      await optimized('a{font-family:"Roboto Serif",sans-serif}'),
      'a{font-family:"Roboto Serif",sans-serif}',
    );
  });
  it('should escape spaces preceding digits', async () => {
    assert.equal(
      await optimized('a{font-family:"Basta 1234",sans-serif}'),
      'a{font-family:Basta\\ 1234,sans-serif}',
    );
    assert.equal(
      await optimized('a{font-family:"Basta 1 2 3 4",sans-serif}'),
      'a{font-family:"Basta 1 2 3 4",sans-serif}',
    );
  });
});
