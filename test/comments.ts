import * as assert from 'assert';

import {parsed} from './_helpers';

describe('Comments', () => {
  it('should parse properly', () => {
    assert.equal(parsed('/*foo*/'), '');
    assert.equal(parsed('/*! foo !*/'), '');
    assert.equal(parsed('/*! * Bootstrap v3.\n*/'), '');
  });
});
