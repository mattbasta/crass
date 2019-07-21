import * as assert from 'assert';

import { optimized } from '../_helpers';

describe('calc()', () => {
  it('should handle MathSum sign changes correctly', async () => {
    assert.equal(
      await optimized('a{b:calc(1px - (2em + 3vh) + 4vw)}'),
      'a{b:calc(1px - 2em - 3vh + 4vw)}',
    );
  });
  it('should handle MathSum sign changes correctly, but in reverse this time', async () => {
    assert.equal(
      await optimized('a{b:calc(1px - (2em - 3vh) + 4vw)}'),
      'a{b:calc(1px - 2em + 3vh + 4vw)}',
    );
  });
  it('should handle MathSum evaluation well', async () => {
    assert.equal(
      await optimized('a{b:calc(3px - 2px + 1px - 0px)}'),
      'a{b:2px}',
    );
  });
  it('should reduce nested MathSum expressions appropraitely when the MathSum is on the lhs', async () => {
    assert.equal(
      await optimized('a{b:calc((2px + 3vh) - 1px)}'),
      'a{b:calc(1px + 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc((2vh + 3px) - 1px)}'),
      'a{b:calc(2vh + 2px)}',
    );
    assert.equal(
      await optimized('a{b:calc((2px + 3vh) + 1px)}'),
      'a{b:calc(3px + 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc((2vh + 3px) + 1px)}'),
      'a{b:calc(2vh + 4px)}',
    );

    assert.equal(
      await optimized('a{b:calc((2px - 3vh) - 1px)}'),
      'a{b:calc(1px - 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc((2vh - 3px) - 1px)}'),
      'a{b:calc(2vh - 4px)}',
    );
    assert.equal(
      await optimized('a{b:calc((2px - 3vh) + 1px)}'),
      'a{b:calc(3px - 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc((2vh - 3px) + 1px)}'),
      'a{b:calc(2vh - 2px)}',
    );
  });
  it('should reduce nested MathSum expressions appropraitely when the MathSum is on the rhs', async () => {
    assert.equal(
      await optimized('a{b:calc(1px - (2px + 3vh))}'),
      'a{b:calc(-1px - 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc(1px - (2vh + 3px))}'),
      'a{b:calc(-2px - 2vh)}',
    );
    assert.equal(
      await optimized('a{b:calc(1px + (2px + 3vh))}'),
      'a{b:calc(3px + 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc(1px + (2vh + 3px))}'),
      'a{b:calc(4px + 2vh)}',
    );

    assert.equal(
      await optimized('a{b:calc(1px - (2px - 3vh))}'),
      'a{b:calc(-1px + 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc(1px - (2vh - 3px))}'),
      'a{b:calc(4px - 2vh)}',
    );
    assert.equal(
      await optimized('a{b:calc(1px + (2px - 3vh))}'),
      'a{b:calc(3px - 3vh)}',
    );
    assert.equal(
      await optimized('a{b:calc(1px + (2vh - 3px))}'),
      'a{b:calc(-2px + 2vh)}',
    );
  });
});
