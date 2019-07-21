import * as assert from 'assert';

import {parsed, pretty, optimized} from './_helpers';

describe('@namespace', () => {
  it('should parse default @namespace blocks', () => {
    assert.equal(
      parsed('@namespace "namespace uri";'),
      '@namespace "namespace uri";',
    );
  });
  it('should parse default @namespace blocks with junk before the semicolon', () => {
    assert.equal(
      parsed('@namespace "namespace uri"    \t\n;'),
      '@namespace "namespace uri";',
    );
  });
  it('should parse multiple @namespace blocks', () => {
    assert.equal(
      parsed('@namespace "namespace uri"; @namespace foo "bar";'),
      '@namespace "namespace uri";@namespace foo "bar";',
    );
  });
  it('should parse @namespace blocks', () => {
    assert.equal(
      parsed('@namespace empty "namespace uri";'),
      '@namespace empty "namespace uri";',
    );
  });

  it('should pretty print', async () => {
    assert.equal(
      await pretty('@namespace "namespace uri";'),
      '@namespace "namespace uri";\n',
    );
    assert.equal(
      await pretty('@namespace empty "namespace uri";'),
      '@namespace empty "namespace uri";\n',
    );
  });

  it('should have no optimizations', async () => {
    assert.equal(
      await optimized('@namespace "namespace uri";'),
      '@namespace "namespace uri";',
    );
  });
});
