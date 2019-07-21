import * as assert from 'assert';

import {parityFilled, optimized} from './_helpers';

var filler = 'a{a:b;x:y}';
const parity = async (data: string) => parityFilled(data, filler);

describe('@-viewport', () => {
  it('should parse basic viewport block', async () => {
    await parity('@viewport{x:y}');
  });
  it('should parse basic vendor-prefixed viewport block', async () => {
    await parity('@-ms-viewport{x:y}');
  });

  it('should optimize contents', async () => {
    assert.equal(await optimized('@viewport{x:y;x:y}'), '@viewport{x:y}');
  });
  it('should optimize away vendor prefixes', async () => {
    assert.equal(await optimized('@-ms-viewport{-webkit-x:y;}'), '');
  });
});
