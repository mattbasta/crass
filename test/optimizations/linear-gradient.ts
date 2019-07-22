import * as assert from 'assert';

import {optimized, pretty} from '../_helpers';
import {OptimizeKeywords} from '../../src/nodes/Node';

async function parseCompare(
  data: string,
  expected: string,
  kw?: OptimizeKeywords,
) {
  if (kw) {
    if (kw.o1 && data !== expected) {
      assert.notEqual(await optimized(data), expected);
    }
    assert.equal(await optimized(data, kw), expected);
    assert.equal(await optimized(await pretty(data), kw), expected);
  } else {
    assert.equal(await optimized(data), expected);
  }
}

describe('linear-gradient', () => {
  describe('initial angle', () => {
    it('should convert "to top" to 0', async () => {
      await parseCompare(
        'x{background:linear-gradient(to top,#fff,#000)}',
        'x{background:linear-gradient(0,#fff,#000)}',
      );
    });
    it('should convert "to right" to 0', async () => {
      await parseCompare(
        'x{background:linear-gradient(to right,#fff,#000)}',
        'x{background:linear-gradient(90deg,#fff,#000)}',
      );
    });
    it('should convert "to bottom" to 0', async () => {
      await parseCompare(
        'x{background:linear-gradient(to bottom,#fff,#000)}',
        'x{background:linear-gradient(180deg,#fff,#000)}',
      );
    });
    it('should convert "to left" to 0', async () => {
      await parseCompare(
        'x{background:linear-gradient(to left,#fff,#000)}',
        'x{background:linear-gradient(270deg,#fff,#000)}',
      );
    });
    it('should not convert "to top right" to 0', async () => {
      // carries over for other values also
      await parseCompare(
        'x{background:linear-gradient(to top right,#fff,#000)}',
        'x{background:linear-gradient(to top right,#fff,#000)}',
      );
    });
  });
  describe('dimension reduction', () => {
    it('should reduce lengths if they are the same', async () => {
      await parseCompare(
        'x{background:linear-gradient(0,#fff 50%,#000 50%)}',
        'x{background:linear-gradient(0,#fff 50%,#000 0)}',
      );
    });
    it('should reduce lengths if they are less', async () => {
      await parseCompare(
        'x{background:linear-gradient(0,#fff 50%,#000 25%)}',
        'x{background:linear-gradient(0,#fff 50%,#000 0)}',
      );
    });
    it('should not reduce lengths if they are different units', async () => {
      await parseCompare(
        'x{background:linear-gradient(0,#fff 50%,#000 25px)}',
        'x{background:linear-gradient(0,#fff 50%,#000 25px)}',
      );
    });
    it('should not reduce trailing zeroes', async () => {
      await parseCompare(
        'x{background:linear-gradient(0,#fff 50%,#000 0)}',
        'x{background:linear-gradient(0,#fff 50%,#000 0)}',
      );
    });
    it('should reduce repeating radial gradient values', async () => {
      await parseCompare(
        'x{background:radial-gradient(0,#fff 5px,#888 5px,#000 50px)}',
        'x{background:radial-gradient(0,#fff 5px,#888 0,#000 50px)}',
      );
    });
  });
});
