import * as assert from 'assert';

import {optimized} from './_helpers';

import * as browser_support from '../src/browser_support';

describe('parseBrowser', () => {
  it('should parse basic values', () => {
    var chrome23 = browser_support.parseBrowser('chr23');
    assert.equal(chrome23.browser, 'chrome');
    assert.equal(chrome23.version, 23);

    var ie9 = browser_support.parseBrowser('ie9');
    assert.equal(ie9.browser, 'ie');
    assert.equal(ie9.version, 9);
  });
});

function getMins(str: string) {
  var kw = {browser_min: {}};
  str
    .split(',')
    .map(browser_support.parseBrowser)
    .forEach((plat) => {
      kw.browser_min[plat.browser] = plat.version;
    });
  return kw;
}

describe('supportsDeclaration', () => {
  beforeEach(() => {
    browser_support.DECLARATIONS_REMOVED['-foo-bar'] = {ie: 6, firefox: 4};
  });
  afterEach(() => {
    delete browser_support.DECLARATIONS_REMOVED['-foo-bar'];
  });

  it('should return true when no mins have been provided', () => {
    assert(browser_support.supportsDeclaration('foo', {}));
  });
  it('should return true when the declaration is unrecognized', () => {
    assert(
      browser_support.supportsDeclaration(
        'foo',
        getMins('ie1000,fx1000,chr1000'),
      ),
    );
  });
  it('should return true when the declaration is recognized but all browsers support the decl', async () => {
    var kw = getMins('ie1,fx1,chr1');
    assert(browser_support.supportsDeclaration('-moz-border-radius', kw));
    assert.equal(
      await optimized('a{-moz-border-radius:0}', kw),
      'a{-moz-border-radius:0}',
    );
  });
  it('should return false when at least one supported browser uses the feature', () => {
    var kw = getMins('ie5,fx10');
    assert(browser_support.supportsDeclaration('-foo-bar', kw));
  });
  it('should return false when the declaration is unrecognized by the selected browsers', async () => {
    var kw = getMins('ie1,fx5,chr1');
    assert(!browser_support.supportsDeclaration('-moz-border-radius', kw));
    assert.equal(await optimized('a{-moz-border-radius:0}'), '');
    assert.equal(
      optimized('a{-moz-border-radius:0;foo:bar}', kw),
      'a{foo:bar}',
    );
  });

  it('should handle ie5/6 hacks', () => {
    var oldIE = getMins('ie1,fx1,chr1');
    var newIE = getMins('ie7,fx1,chr1');
    assert(browser_support.supportsDeclaration('_font-face', oldIE));
    assert(!browser_support.supportsDeclaration('_font-face', newIE));
  });
});

describe('supportsKeyframe', () => {
  it('should return false for unrecognized browsers', () => {
    assert(
      browser_support.supportsKeyframe('-webkit-', getMins('ie1,fx1,chr1')),
    );
  });
  it('should return false for unrelated browsers', () => {
    assert(
      browser_support.supportsKeyframe('-webkit-', getMins('ie1000,fx1,chr1')),
    );
  });
  it('should return true for recognized browsers', () => {
    assert(
      !browser_support.supportsKeyframe('-webkit-', getMins('ie1,fx1,chr1000')),
    );
  });
  it('should return false for known invalid prefixes', () => {
    assert(!browser_support.supportsKeyframe('-ms-', {}));
  });
});
