import * as assert from 'assert';

import {parsed} from '../_helpers';

describe('invalid charsets', () => {
  it('should be dropped', () => {
    assert.equal(parsed('a{x:y}@charset "foo";'), 'a{x:y}');
  });
});
