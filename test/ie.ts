import * as assert from 'assert';

import {
  optimized,
  parsed,
  parity,
  parityOpt,
  parityOptSaveIE,
} from './_helpers';

describe('filter', () => {
  const ie10_min = {browser_min: {ie: 10}};
  const ie9_min = {browser_min: {ie: 9}};

  it('can be vanilla', () => {
    assert.equal(parsed('a{filter:foo}'), 'a{filter:foo}');
    assert.equal(parsed('a{filter:progid:foo()}'), 'a{filter:progid:foo()}');
  });
  it('can be short', () => {
    parity('a{filter:alpha(opacity=50)}');
  });
  it('can be old-style', () => {
    assert.equal(
      parsed(
        'a{filter:progid:DXImageTransform.Microsoft.filtername(strength=50)}',
      ),
      'a{filter:progid:DXImageTransform.Microsoft.filtername(strength=50)}',
    );
  });
  it('can have strings', () => {
    assert.equal(
      parsed(
        "a{filter:progid:DXImageTransform.Microsoft.Iris(irisstyle='STAR' duration=4)}",
      ),
      "a{filter:progid:DXImageTransform.Microsoft.Iris(irisstyle='STAR' duration=4)}",
    );
  });
  it('can have multiple progids', () => {
    assert.equal(
      parsed(
        'a{filter:progid:DXImageTransform.Microsoft.MotionBlur(strength=50)\nprogid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)}',
      ),
      'a{filter:progid:DXImageTransform.Microsoft.MotionBlur(strength=50)\nprogid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)}',
    );
  });
  it('can be prefixed', () => {
    assert.equal(
      parsed('a{-ms-filter: alpha(opacity=50)}'),
      'a{-ms-filter: alpha(opacity=50)}',
    );
  });

  it('is removed in IE10+', async () => {
    assert.equal(
      await optimized('a{filter:progid:foo();zip:zap}', ie9_min),
      'a{filter:progid:foo();zip:zap}',
    );
    assert.equal(
      await optimized('a{filter:progid:foo();zip:zap}', ie10_min),
      'a{zip:zap}',
    );
    assert.equal(
      await optimized(
        'a{filter:progid:DXBlahBlahBlah.foo.bar(lol=omg);zip:zap}',
        ie10_min,
      ),
      'a{zip:zap}',
    );
  });

  it('is removed when the -ms-filter variant is used in IE10', async () => {
    assert.equal(
      await optimized('a{-ms-filter:alpha(foo=bar);zip:zap}', {
        browser_min: {ie: 10},
      }),
      'a{zip:zap}',
    );
  });

  it('is has whitespace stripped during optimization', async () => {
    assert.equal(
      await optimized('a{filter : alpha(foo=bar);}', {o1: true}),
      'a{filter:alpha(foo=bar)}',
    );
    assert.equal(
      await optimized('a{-ms-filter : alpha(foo=bar);}', {o1: true}),
      'a{-ms-filter:alpha(foo=bar)}',
    );
  });
});

describe('expressions', () => {
  it('can be vanilla', async () => {
    await parity('a{foo:expression(document.innerWidth)}');
  });
  it('are treated as terms', () => {
    assert.equal(
      parsed('a{foo:3px expression(document.innerWidth) auto}'),
      'a{foo:3px expression(document.innerWidth) auto}',
    );
  });
  it('can contain simple binops', () => {
    assert.equal(
      parsed('a{foo: expression(document.innerWidth > 6)}'),
      'a{foo:expression(document.innerWidth > 6)}',
    );
  });
  it('can contain maths', () => {
    assert.equal(
      parsed(
        'a{foo: expression(document.innerWidth / 2 - foo.innerWidth / 2)}',
      ),
      'a{foo:expression(document.innerWidth / 2 - foo.innerWidth / 2)}',
    );
  });
});

describe('slash 9', () => {
  it('is parsed', async () => {
    await parity('a{foo:bar\\9}');
    await parity('a{foo:bar \\9}', 'a{foo:bar\\9}');
  });
  it('is ignored by default on optimizations', async () => {
    await parityOpt('a{foo:bar\\9}', '');
    await parityOptSaveIE('a{foo:bar\\9}');
  });
});

describe('slash 0', () => {
  it('is parsed', async () => {
    await parity('a{foo:bar\\0}');
    await parity('a{foo:bar \\0}', 'a{foo:bar\\0}');
  });
  it('is ignored by default on optimizations', async () => {
    await parityOpt('a{foo:bar\\0}', '');
    await parityOptSaveIE('a{foo:bar\\0}');
  });
});

describe('star hack', () => {
  it('is ignored by default on optimizations', async () => {
    await parityOpt('a{*foo:bar}', '');
    await parityOptSaveIE('a{*foo:bar}');
  });
});

describe('* html hack', () => {
  it('is ignored by default on optimizations', async () => {
    await parityOpt('* html{foo:bar}', '');
    await parityOptSaveIE('* html{foo:bar}');
  });
  it('is ignored by default on optimizations with descendants', async () => {
    await parityOpt('* html foo{foo:bar}', '');
    await parityOptSaveIE('* html foo{foo:bar}');
  });
  it('is ignored as part of a selector list by default on optimizations', async () => {
    await parityOpt('* html,bar{foo:bar}', 'bar{foo:bar}');
    await parityOptSaveIE('* html,bar{foo:bar}');
  });
  it('is ignored as part of a selector list by default on optimizations with descendants', async () => {
    await parityOpt('* html foo,bar{foo:bar}', 'bar{foo:bar}');
    await parityOptSaveIE('* html foo,bar{foo:bar}');
  });
});

describe('flexbox display values', () => {
  it('are ignored when no compat is specified', async () => {
    assert.equal(
      await optimized('a{display:-ms-flexbox}'),
      'a{display:-ms-flexbox}',
      'should have been ignored',
    );
  });
  it('are removed for ie10 and earlier', async () => {
    assert.equal(
      await optimized('a{display:-ms-flexbox}', {browser_min: {ie: 10}}),
      'a{display:-ms-flexbox}',
      'should have been ignored',
    );
  });
  it('are removed for ie11 and later', async () => {
    assert.equal(
      await optimized('a{display:-ms-flexbox;color:red}', {
        browser_min: {ie: 11},
      }),
      'a{color:red}',
      'should have removed the value',
    );
  });
});

describe('#ie8#hack', () => {
  it('should be removed', async () => {
    assert.equal(await optimized('#ie8#hack,a{b:c}'), 'a{b:c}');
    assert.equal(await optimized('#ie8#hack{b:c}'), '');
  });
  it('should be preserved when saveie is present', async () => {
    assert.equal(
      await optimized('#ie8#hack,a{b:c}', {saveie: true}),
      '#ie8#hack,a{b:c}',
    );
    assert.equal(
      await optimized('#ie8#hack{b:c}', {saveie: true}),
      '#ie8#hack{b:c}',
    );
  });
});
