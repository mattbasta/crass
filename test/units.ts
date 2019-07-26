import * as assert from 'assert';
import {optimized} from './_helpers';

const parseString = function(data, o1) {
  const params = {};
  if (o1) params.o1 = true;
  return crass
    .parse(data)
    .optimize(params)
    .toString();
};

describe('Length', () => {
  it('should convert in', async () => {
    assert.equal(await optimized('a{width:96px}'), 'a{width:1in}');
  });
  it('should convert pc', async () => {
    assert.equal(await optimized('a{width:16px}'), 'a{width:1pc}');
  });
  it('should convert pt', async () => {
    assert.equal(await optimized('a{width:12pt}'), 'a{width:1pc}');
  });
  it('should convert cm', async () => {
    // Only on O1
    assert.equal(
      await optimized('a{width:37.79px}', {o1: true}),
      'a{width:1cm}',
    );
  });
  it('should convert mm', async () => {
    // Only on O1
    assert.equal(
      await optimized('a{width:11.337px}', {o1: true}),
      'a{width:3mm}',
    );
  });
  it('should convert cm', async () => {
    // Only on O1
    assert.equal(
      await optimized('a{width:1.0007cm}', {o1: true}),
      'a{width:.3939in}',
    );
    assert.equal(await optimized('a{width:1.0007cm}'), 'a{width:1.0007cm}');
  });
  it('should convert mm', async () => {
    // Only on O1
    assert.equal(
      await optimized('a{width:1.0007mm}', {o1: true}),
      'a{width:.1cm}',
    );
    assert.equal(await optimized('a{width:1.0007mm}'), 'a{width:1.0007mm}');
  });
  it('should convert q', async () => {
    // Only on O1
    assert.equal(await optimized('a{width:1mm}', {o1: true}), 'a{width:4q}');
    assert.equal(await optimized('a{width:1mm}'), 'a{width:1mm}');
  });
});

describe('Angles', () => {
  it('should convert grad', async () => {
    assert.equal(
      await optimized('a{transform:rotate(100grad)}'),
      'a{transform:rotate(90deg)}',
    );
  });
  it('should convert rad', async () => {
    assert.equal(
      await optimized('a{transform:rotate(6.283186rad)}'),
      'a{transform:rotate(360deg)}',
    );
  });
  it('should convert deg', async () => {
    assert.equal(
      await optimized('a{transform:rotate(7.2deg)}'),
      'a{transform:rotate(8grad)}',
    );
  });
});

describe('Temporal', () => {
  it('should convert s', async () => {
    assert.equal(
      await optimized('a{transition:all 5000ms}'),
      'a{transition:all 5s}',
    );
  });
  it('should convert ms', async () => {
    assert.equal(
      await optimized('a{transition:all .005s}'),
      'a{transition:all 5ms}',
    );
  });
});

describe('Frequency', () => {
  it('should convert Hz', async () => {
    assert.equal(await optimized('a{foo:5000Hz}'), 'a{foo:5kHz}');
  });
  it('should convert kHz', async () => {
    assert.equal(await optimized('a{foo:.005kHz}'), 'a{foo:5Hz}');
  });
});

describe('Resolution', () => {
  it('should convert dpi', async () => {
    assert.equal(await optimized('a{foo:1dpi}'), 'a{foo:1dpi}');
  });
  it('should convert dpcm', async () => {
    assert.equal(await optimized('a{foo:2.54dpcm}'), 'a{foo:1dpi}');
  });
  it('should convert dppx', async () => {
    assert.equal(await optimized('a{foo:96dppx}'), 'a{foo:1dpi}');
  });
});

describe('Zero', () => {
  it('should drop units for length', async () => {
    assert.equal(await optimized('a{foo:0px}'), 'a{foo:0}');
    assert.equal(await optimized('a{foo:0em}'), 'a{foo:0}');
  });
  it('should not drop units for non-length', async () => {
    assert.equal(await optimized('a{foo:0s}'), 'a{foo:0s}');
    assert.equal(await optimized('a{foo:0deg}'), 'a{foo:0deg}');
  });
});
