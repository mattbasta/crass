import * as assert from 'assert';

import * as objects from '../src/objects';
import * as utils from '../src/utils';

describe('opts', () => {
  it('should default to process.argv', () => {
    assert.equal(
      JSON.stringify(utils.opts()),
      JSON.stringify(utils.opts(process.argv)),
    );
  });
  it('should accept a list of arguments', () => {
    const out = utils.opts(['--foo', 'bar', '-f', 'b']);
    assert.equal(out.foo, 'bar');
    assert.equal(out.f, 'b');
  });
  it('should accept flags', () => {
    const out = utils.opts(['--hello', '--foo', 'bar', '-f', 'b']);
    assert.equal(out.hello, true);
  });
  it('should accept flags at the end', () => {
    const out = utils.opts(['--foo', 'bar', '-f', 'b', '--hello']);
    assert.equal(out.hello, true);
  });
});

describe('joinAll', () => {
  it('should return empty string if there is no list', () => {
    assert.equal(utils.joinAll([]), '');
  });
  it('should return each of the items joined together', () => {
    assert.equal(utils.joinAll([1, 2, 3, true]), '123true');
  });
  it('should accept a delimiter', () => {
    assert.equal(utils.joinAll([1, 2, 3, true], ' '), '1 2 3 true');
  });
  it('should accept a mapper', () => {
    assert.equal(
      utils.joinAll([1, 2, 3, true], ' ', x => x.toString()[0]),
      '1 2 3 t',
    );
  });
});

describe('uniq', () => {
  it('should remove duplicate entries', () => {
    assert.deepEqual(
      utils.uniq(utils.stringIdentity, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]),
      [1, 2, 3, 4],
    );
  });
  it('should remove duplicate entries with a custom lambda', () => {
    function lambda(x: [number, number]) {
      return x[1].toString();
    }
    assert.deepEqual(
      utils.uniq(lambda, [
        [1, 1],
        [1, 2],
        [2, 3],
        [2, 4],
        [2, 4],
        [3, 4],
        [4, 4],
      ]),
      [[1, 1], [1, 2], [2, 3], [4, 4]],
    );
  });
});

describe('indent', () => {
  it('should return empty string if no input is given', () => {
    assert.equal(utils.indent('', 4), '');
  });
  it('should return an indented string', () => {
    assert.equal(utils.indent('foo', 4), '        foo');
  });
});

describe('prettyMap', () => {
  it('should return the output of `pretty`', async () => {
    assert.equal(
      await utils.prettyMap(123)({
        pretty: async function(x) {
          assert.equal(x, 123);
          return 'pretty indeed';
        },
      } as any),
      'pretty indeed',
    );
  });
  it('should return the output of `toString` if `pretty` is undefined', async () => {
    assert.equal(
      await utils.prettyMap(123)({
        toString: () => {
          return 'not pretty';
        },
      } as any),
      'not pretty',
    );
  });
});
