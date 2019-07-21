import * as assert from 'assert';

import {parsed, pretty, optimized} from './_helpers';

describe('@import', () => {
  it('should parse @import blocks with strings', () => {
    assert.equal(parsed('@import "foo.css";'), '@import "foo.css";');
  });
  it('should parse @import blocks with junk before the semicolon', () => {
    assert.equal(parsed('@import "foo.css"   \n;'), '@import "foo.css";');
  });
  it('should parse @import blocks with URIs', () => {
    assert.equal(parsed('@import url("foo.css");'), '@import "foo.css";');
  });
  it('should parse @import blocks with URIs that require uri blocks', () => {
    assert.equal(
      parsed('@import url(valid/url"foo.css".foo);'),
      '@import \'valid/url"foo.css".foo\';',
    );
  });
  it('should parse @import blocks with mediums', () => {
    assert.equal(
      parsed('@import "foo.css" screen;'),
      '@import "foo.css" screen;',
    );
  });

  it('should pretty print', async () => {
    assert.equal(await pretty('@import "foo.css";'), '@import "foo.css";\n');
  });

  it('should have no optimizations', async () => {
    assert.equal(await optimized('@import "foo.css";'), '@import "foo.css";');
  });
});
