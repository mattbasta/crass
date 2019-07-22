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

describe('colors', () => {
  it('should drop invalid colors', async () => {
    assert.ok(!(await optimized('a{color:rgb(1,2)}')));
    assert.ok(!(await optimized('a{color:rgb(1,2,3,4)}')));
    assert.ok(!(await optimized('a{color:rgb(1,2,foo)}')));
    assert.ok(!(await optimized('a{color:gray(1/2 3)}')));
    assert.ok(!(await optimized('a{color:hwb(4% 0 5%)}'))); // arg 1 should be dimension
    assert.ok(!(await optimized('a{color:hwb(4% 5% 6)}'))); // arg 2 should be dimension
    assert.ok(!(await optimized('a{color:lch(foo 1 1)}'))); // arg 0 should be dimension or num
  });
  it('clamp colors to zero', async () => {
    assert.equal(
      await optimized('b{color:rgba(-100,0,-100,.5)}'),
      'b{color:rgba(0,0,0,.5)}',
    );
  });

  it('long hex to short hex', async () => {
    await parseCompare('b{color:#ffffff}', 'b{color:#fff}');
    await parseCompare('b{color:rgb(0,0,0)}', 'b{color:#000}');
  });

  it('rgb with short hex', async () => {
    await parseCompare('b{color:rgb(255,255,255)}', 'b{color:#fff}');
    await parseCompare('b{color:rgb(0,0,0)}', 'b{color:#000}');
  });
  it('rgb with long hex', async () => {
    await parseCompare('b{color:rgb(255,255,254)}', 'b{color:#fffffe}');
  });
  it('rgb with name', async () => {
    await parseCompare('b{color:rgb(255,0,0)}', 'b{color:red}');
  });
  it('hex with name', async () => {
    await parseCompare('b{color:#f00}', 'b{color:red}');
  });
  it('name with hex', async () => {
    await parseCompare('b{color:blanchedalmond}', 'b{color:#ffebcd}');
  });

  it('hsl with short hex', async () => {
    await parseCompare('b{color:hsl(0,0%,100%)}', 'b{color:#fff}');
  });
  it('hsl with degrees', async () => {
    await parseCompare('b{color:hsl(0deg,0%,100%)}', 'b{color:#fff}');
    await parseCompare('b{color:hsl(360deg,0%,100%)}', 'b{color:#fff}');
    await parseCompare('b{color:hsl(180deg,0%,100%)}', 'b{color:#fff}');
    await parseCompare('b{color:hsl(180deg,50%,50%)}', 'b{color:#40bf50}');
  });
  it('hsl with long hex', async () => {
    await parseCompare('b{color:hsl(1,100%,50%)}', 'b{color:#ff0400}');
  });

  it('rgba with hsla', async () => {
    parseCompare(
      'b{color:rgba(255,255,255,.1)}',
      'b{color:hsla(0,0%,100%,.1)}',
    );
  });

  it('hsla with rgba', async () => {
    await parseCompare(
      'b{color:hsla(255,99%,10%,.1)}',
      'b{color:rgba(13,0,51,.1)}',
    );
  });

  it('rgba with name', async () => {
    await parseCompare('b{color:rgba(255,0,0,1)}', 'b{color:red}');
  });

  it('should clamp opacity', async () => {
    await parseCompare('b{color:rgba(255,0,0,1.1)}', 'b{color:red}');
    await parseCompare('b{color:rgba(255,0,0,-0.1)}', 'b{color:transparent}');
  });

  it('should not shorten to gray when there is an alternative', async () => {
    await parseCompare('b{color:rgb(255,255,255)}', 'b{color:#fff}', {
      css4: true,
    });
    await parseCompare('b{color:hsl(0,0%,100%)}', 'b{color:#fff}', {
      css4: true,
    });
  });
  it('should collapse alpha values of 1', async () => {
    await parseCompare('b{color:rgba(255,255,255, 1)}', 'b{color:#fff}', {
      css4: true,
    });
    await parseCompare('b{color:hsla(0,0%,0%, 1)}', 'b{color:#000}', {
      css4: true,
    });
  });
  it('should generate gray', async () => {
    await parseCompare(
      'b{color:rgba(255,255,255,0.5)}',
      'b{color:gray(100%/.5)}',
      {
        css4: true,
      },
    );
    await parseCompare(
      'b{color:hsla(0,0%,50%, 0.5)}',
      'b{color:lab(53 0 0/.5)}',
      {
        css4: true,
      },
    );
  });
  it('should collapse gray values to keyword', async () => {
    await parseCompare('b{color:hsl(0,0%,50%)}', 'b{color:gray}', {css4: true});
  });

  it('should generate hwb', async () => {
    await parseCompare(
      'b{color:rgba(255,0,0,.5)}',
      'b{color:hwb(0 0% 0%/.5)}',
      {
        css4: true,
      },
    );
  });
  it('should generate alpha hex', async () => {
    await parseCompare('b{color:rgba(255,0,0,0)}', 'b{color:#0000}', {
      css4: true,
    });
    await parseCompare('b{color:rgba(255,0,0,0.2)}', 'b{color:#f003}', {
      css4: true,
    });
    await parseCompare('b{color:#aabbccdd}', 'b{color:#abcd}', {css4: true});
    await parseCompare('b{color:#abcdef11}', 'b{color:#abcdef11}', {
      css4: true,
    });
  });
});
