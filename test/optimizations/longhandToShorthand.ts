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

describe('Merge longhand declarations into shorthand', () => {
  it('collapses longhand declarations into a shorthand declaration when all 4 pieces are specified', async () => {
    await parseCompare(
      'b{padding-bottom: unused;padding-left: left;padding-right: right;padding-top: top;padding-bottom:bottom}',
      'b{padding:top right bottom left}',
    );
  });
  it('collapses longhand declarations when all 4 are the same value', async () => {
    await parseCompare(
      'b{padding-bottom: unused;padding-left: same;padding-right: same;padding-top: same;padding-bottom:same}',
      'b{padding:same}',
    );
  });
  it('does not collapse declarations when not all 4 are specified', async () => {
    await parseCompare(
      'b{padding-bottom: unused;padding-right: right;padding-top: top;padding-bottom: bottom}',
      'b{padding-bottom:bottom;padding-right:right;padding-top:top}',
    );
  });
  it('should handle text-decoration', async () => {
    await parseCompare(
      `
      b {
          text-decoration-line: underline overline;
          text-decoration-style: dashed;
          text-decoration-color: red;
      }
      `,
      'b{text-decoration:underline overline dashed red}',
    );
  });

  it('should handle border shorthand', async () => {
    await parseCompare(
      `
      a {
          border-left-width: same;
          border-top-width: same;
          border-bottom-width: same;
          border-right-width: same;
          border-color: red;
          border-style: dashed;
      }
      `,
      'a{border:same dashed red}',
    );
    await parseCompare(
      `
      a {
          border-left: 2px solid red;
          border-right: 2px solid red;
          border-top: 2px solid red;
          border-bottom: 2px solid red;
      }
      `,
      'a{border:2px solid red}',
    );
  });
  it('should handle border-radius simple shorthand', async () => {
    await parseCompare(
      `
      a {
          border-top-left-radius: tl;
          border-top-right-radius: tr;
          border-bottom-right-radius: br;
          border-bottom-left-radius: bl;
      }
      `,
      'a{border-radius:tl tr br bl}',
    );
  });
  it('should handle border-radius complex shorthand', async () => {
    await parseCompare(
      `
      a {
          border-top-left-radius: tl1 tl2;
          border-top-right-radius: tr1 tr2;
          border-bottom-right-radius: br1 br2;
          border-bottom-left-radius: bl1 bl2;
      }
      `,
      'a{border-radius:tl1 tr1 br1 bl1/tl2 tr2 br2 bl2}',
    );
    await parseCompare(
      `
      a {
          border-top-left-radius: tl1 tl2;
          border-top-right-radius: tr1;
          border-bottom-right-radius: br1 br2;
          border-bottom-left-radius: bl1 bl1;
      }
      `,
      'a{border-radius:tl1 tr1 br1 bl1/tl2 tr1 br2 bl1}',
    );
    await parseCompare(
      `
      a {
          border-top-left-radius: tl1 tl2;
          border-top-right-radius: x;
          border-bottom-right-radius: br1 br2;
          border-bottom-left-radius: bl1 x;
      }
      `,
      'a{border-radius:tl1 x br1 bl1/tl2 x br2}',
    );
  });
});
