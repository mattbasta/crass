import * as assert from 'assert';

import {pretty, parsed} from './_helpers';

describe('!important', () => {
  it('should parse appropriately', () => {
    assert.equal(parsed('foo {a: b !important}'), 'foo{a:b!important}');
  });
  it('should pretty print appropriately', async () => {
    assert.equal(
      await pretty('foo {a: b !important}'),
      'foo {\n  a: b !important;\n}\n',
    );
  });
});
