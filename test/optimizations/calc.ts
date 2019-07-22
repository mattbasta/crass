import * as assert from 'assert';

import {OptimizeKeywords} from '../../src/nodes/Node';
import {optimized, pretty} from '../_helpers';

async function parseCompare(
  dataRaw: string,
  expectedRaw: string,
  kw?: OptimizeKeywords,
) {
  const data = `a{b:${dataRaw}}`;
  const expected = expectedRaw ? `a{b:${expectedRaw}}` : '';
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

describe('calc()', () => {
  it('should reduce simple math', async () => {
    await parseCompare('calc(1 + 1)', '2');
    await parseCompare('calc(1 - 1)', '0');
    await parseCompare('calc(2 * 2)', '4');
    await parseCompare('calc(8 / 2)', '4');
    await parseCompare('calc((6 / 2) - (4 * 2) + 1)', '-4');
  });

  it('should reduce expressions with a single unit', async () => {
    await parseCompare('calc(3px * 2 - 1px)', '5px');
    await parseCompare('calc(3rem * 2 - 1rem)', '5rem');
    await parseCompare('calc(3em * 2 - 1em)', '5em');
    await parseCompare('calc(3pt * 2 - 1pt)', '5pt');
    await parseCompare('calc(3vh * 2 - 1vh)', '5vh');
  });

  it('should multiply percentages', async () => {
    await parseCompare('calc(2 * 50%)', '100%');
    await parseCompare('calc(120% * 50%)', '60%');
  });

  it('should handle Hz and kHz', async () => {
    await parseCompare('calc(2 * 50kHz)', '100kHz');
    await parseCompare('calc(2 * 50Hz)', '100Hz');
  });

  it('should drop invalid calculations', async () => {
    await parseCompare('calc(2px + 3s)', '');
    await parseCompare('calc(2em + 4kHz)', '');
    await parseCompare('calc(2rem * (2 * (2 + 3)) + 4 + (5/2))', '');
    await parseCompare(
      'calc((4 * 2) + 4.2 + 1 + (2rem * .4) + (2px * .4))',
      '',
    );
    await parseCompare('calc(50% / 0)', '');
  });

  it('should ignore unrecognized units', async () => {
    await parseCompare('calc(2px + 3vm)', 'calc(2px + 3vm)'); // vm is IE's version of vmin
  });

  it('should handle complex expressions', async () => {
    await parseCompare('calc(calc(100 + 10) + 1)', '111');
    await parseCompare('calc(calc(calc(1rem * 0.75) * 1.5) - 1rem)', '.125rem');
    await parseCompare(
      'calc(calc(calc(1rem * 0.75) * 1.5) - 1px)',
      'calc(1.125rem - 1px)',
    );
    await parseCompare(
      'calc(((1rem * 0.75) * 1.5) - 1px)',
      'calc(1.125rem - 1px)',
    );
    await parseCompare(
      'calc(-1px + (1.5 * (1rem * 0.75)))',
      'calc(-1px + 1.125rem)',
    );
    await parseCompare('calc((2 * 100) / 12)', '16.6666');
    await parseCompare('calc((100 / 12) * 2)', '16.6666');
    await parseCompare(
      'calc(50% - 50vw + (100vw - 100vw) / 2 + 1em)',
      'calc(50% - 50vw + 0 + 1em)',
    );

    await parseCompare('calc(50% + 0px)', '50%');
    await parseCompare('calc(50% - 0px)', '50%');
    await parseCompare('calc(50% + 0)', '50%');
    await parseCompare('calc(50% - 0)', '50%');
    await parseCompare('calc(0px + 50%)', '50%');
    await parseCompare('calc(0 + 50%)', '50%');
    await parseCompare('calc(0 - 50%)', '-50%');

    await parseCompare('calc(0 / 1)', '0');
    await parseCompare('calc(0px / 1)', '0');
  });
});
