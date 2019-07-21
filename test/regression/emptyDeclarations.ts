import * as assert from 'assert';

import {parsed, pretty, optimized} from '../_helpers';

describe('empty declarations', () => {
  it('should render', () => {
    assert.equal(parsed('a{b:;}'), 'a{b:}');
    assert.equal(parsed('a{b:}'), 'a{b:}');
  });
  it('should pretty print', async () => {
    assert.equal(await pretty('a{b:;}'), 'a {\n  b: ;\n}\n');
    assert.equal(await pretty('a{b:}'), 'a {\n  b: ;\n}\n');
  });
  it('should optimize away', async () => {
    assert.equal(await optimized('a{b:;}'), '');
    assert.equal(await optimized('a{b:}'), '');
  });
});
