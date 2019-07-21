import * as assert from 'assert';

import {optimized, parsed, pretty} from './_helpers';

describe('@charset', () => {
  it('should parse valid @charset blocks', () => {
    assert.equal(parsed('@charset "utf-8";'), '@charset "utf-8";');
  });

  it('should pretty print charsets', async () => {
    assert.equal(await pretty('@charset "utf-8";'), '@charset "utf-8";\n');
  });

  it('should have no optimizations', async () => {
    assert.equal(await optimized('@charset "utf-8";'), '@charset "utf-8";');
  });
});
