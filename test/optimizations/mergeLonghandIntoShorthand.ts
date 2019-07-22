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

describe('Merge late longhand into early shorthand', () => {
  it('should collapse basic quad lists', async () => {
    await parseCompare(
      `
      a {
          padding: top right bottom left;
          padding-bottom: foo;
      }
      `,
      'a{padding:top right foo left}',
    );
  });

  it('should expand quad lists if needed', async () => {
    await parseCompare(
      `
      a {
          padding: all;
          padding-top: top;
      }
      `,
      'a{padding:top all all}',
    );
    await parseCompare(
      `
      a {
          padding: all;
          padding-right: right;
      }
      `,
      'a{padding:all right all all}',
    );
    await parseCompare(
      `
      a {
          padding: all;
          padding-bottom: bottom;
      }
      `,
      'a{padding:all all bottom}',
    );
    await parseCompare(
      `
      a {
          padding: all;
          padding-left: left;
      }
      `,
      'a{padding:all all all left}',
    );
  });

  it('should merge borders based on direction', async () => {
    await parseCompare(
      `
      a {
          border: 1px solid red;
          border-left: 1px solid red;
      }
      `,
      'a{border:1px solid red}',
    );
  });

  it('should merge borders based on component', async () => {
    await parseCompare(
      `
      a {
          border: 1px solid red;
          border-color: new-color;
      }
      `,
      'a{border:1px solid new-color}',
    );
  });

  it('should merge border-radius in the happy case', async () => {
    await parseCompare(
      `
      a {
          border-radius: all;
          border-top-left-radius: tlr;
      }
      `,
      'a{border-radius:tlr all all}',
    );
    await parseCompare(
      `
      a {
          border-radius: all;
          border-top-right-radius: trr;
      }
      `,
      'a{border-radius:all trr all all}',
    );
    await parseCompare(
      `
      a {
          border-radius: all;
          border-bottom-left-radius: blr;
      }
      `,
      'a{border-radius:all all all blr}',
    );
    await parseCompare(
      `
      a {
          border-radius: all;
          border-bottom-right-radius: brr;
      }
      `,
      'a{border-radius:all all brr}',
    );
  });

  it('should merge border-radius in the complex case', async () => {
    await parseCompare(
      `
      a {
          border-radius: x/y;
          border-top-left-radius: tlr;
      }
      `,
      'a{border-radius:tlr x x/tlr y y}',
    );
    await parseCompare(
      `
      a {
          border-radius: x/y;
          border-top-left-radius: a/b;
      }
      `,
      'a{border-radius:a x x/b y y}',
    );
  });
});
