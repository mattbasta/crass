import * as assert from 'assert';
import {optimized} from '../_helpers';

describe('attribute selectors', () => {
  it('should handle attribute values with unusual characters', async () => {
    assert.equal(await optimized('[foo^="tel:"]{a:b}'), '[foo^="tel:"]{a:b}');
    assert.equal(await optimized('[foo^="0"]{a:b}'), '[foo^="0"]{a:b}');
    assert.equal(await optimized('[foo^="bar"]{a:b}'), '[foo^=bar]{a:b}');
    assert.equal(await optimized('[foo^="bar0"]{a:b}'), '[foo^=bar0]{a:b}');
  });
});
