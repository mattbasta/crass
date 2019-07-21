import * as assert from 'assert';

import {
  parityFilled,
  parityOpt,
  parityOptSaveIE,
  optimized,
  optimizedPretty,
  parsed,
} from './_helpers';

var filler = 'a{x:y}';
const parity = async (data: string) => parityFilled(data, filler);

describe('@media', () => {
  it('should parse media types', async () => {
    await parity('@media screen{$$}');
  });

  it('should parse empty media queries', async () => {
    await parity('@media only screen{}');
    await parity(
      '@media only screen and (min-width:769px) and (max-width:1024px){}',
    );
    await parity('@media only screen and (min-width:1025px){}');
    await parity(
      '@media only screen and (min-width:321px) and (max-width:480px){}',
    );
  });

  it('should parse multiple media types', async () => {
    await parity('@media mobile,screen{$$}');
  });

  it('should parse media with constraint', async () => {
    await parity('@media screen and (color){$$}');
  });

  it('should parse media with constraint and value', async () => {
    await parity('@media screen and (min-width:450px){$$}');
  });

  it('should parse multiple media types with constraint and value', async () => {
    await parity('@media mobile and (color),screen and (min-width:450px){$$}');
  });

  it('should parse media with only a constraint', async () => {
    await parity('@media(min-width:450px){$$}');
  });

  it('should parse media block with no media type', async () => {
    await parity('@media(min-width:768px) and (max-width:991px){$$}');
  });

  it('should parse media with prefixes', async () => {
    await parity('@media only screen{$$}');
    await parity('@media not screen{$$}');
    await parity('@media not screen and (min-width:450px){$$}');
    await parity('@media mobile,not screen{$$}');
  });

  it('should parse media with weird constraints', async () => {
    await parity(
      '@media only screen and (-webkit-min-device-pixel-ratio:2){$$}',
    );
  });

  it('should optimize media expressions', async () => {
    assert.equal(
      await optimized('@media (min-width:12pt){x{y:z}}'),
      '@media(min-width:1pc){x{y:z}}',
    );
  });

  describe('nested @media', () => {
    it('should parse properly', async () => {
      await parity('@media screen{@media(min-width:450px){$$}}');
    });
  });

  describe('with @page', () => {
    it('should parse properly', async () => {
      await parity('@media screen{@page{margin:auto}}');
    });
  });

  describe('slash 0', () => {
    const example = '@media(min-width:0\\0){x{y:z}}';
    it('is parsed', async () => {
      await parity(example);
    });
    it('is removed when a min version of IE is set', async () => {
      const min = {ie: 10};
      assert.equal(await optimized(example, {browser_min: min}), '');
      assert.equal(
        parsed(await optimizedPretty(example, {browser_min: min})),
        '',
      );
    });
  });
});
