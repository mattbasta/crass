import * as assert from 'assert';

import {parsed, pretty, optimized} from './_helpers';

describe('Math Expressions', () => {
  it('should parse', () => {
    assert.equal(
      parsed('a{foo:calc(50% - 100px)}'),
      'a{foo:calc(50% - 100px)}',
    );
  });
  it('should parse with products', () => {
    assert.equal(parsed('a{foo:calc(50% * 100px)}'), 'a{foo:calc(50%*100px)}');
    assert.equal(parsed('a{foo:calc(50% / 100px)}'), 'a{foo:calc(50%/100px)}');
    assert.equal(
      parsed('a{foo:calc(5px + 50% * 100px)}'),
      'a{foo:calc(5px + 50%*100px)}',
    );
  });
  it('should parse with sums in products', () => {
    assert.equal(
      parsed('a{foo:calc((5px + 50%) * 100px)}'),
      'a{foo:calc((5px + 50%)*100px)}',
    );
    assert.equal(
      parsed('a{foo:calc(100px * (5px + 50%))}'),
      'a{foo:calc(100px*(5px + 50%))}',
    );
  });
  it('should pretty print', async () => {
    assert.equal(
      await pretty('a{foo:calc(50% * 100px)}'),
      'a {\n  foo: calc(50% * 100px);\n}\n',
    );
    assert.equal(
      await pretty('a{foo:calc(50% * 100px+5px)}'),
      'a {\n  foo: calc(50% * 100px + 5px);\n}\n',
    );
  });
  it('should optimize the terms of a product', async () => {
    assert.equal(
      await optimized('a{foo:calc(12pt * 96px)}'),
      'a{foo:calc(1pc*1in)}',
    );
  });
  it('should optimize the terms of a sum', async () => {
    assert.equal(
      await optimized('a{foo:calc(12pt + 96px)}'),
      'a{foo:calc(1pc + 1in)}',
    );
    assert.equal(
      await optimized('a{foo:calc(12pt - 96px)}'),
      'a{foo:calc(1pc - 1in)}',
    );
  });
});
