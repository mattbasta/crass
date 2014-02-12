var assert = require("assert");

var browser_support = require('../lib/browser_support');
var crass = require('../crass');


describe('parseBrowser', function() {
    it('should parse basic values', function() {
        var chrome23 = browser_support.parseBrowser('chr23');
        assert.equal(chrome23.browser, 'chrome');
        assert.equal(chrome23.version, 23);

        var ie9 = browser_support.parseBrowser('ie9');
        assert.equal(ie9.browser, 'ie');
        assert.equal(ie9.version, 9);
    });
});


function getMins(str) {
    var kw = {browser_min: {}};
    str.split(',').map(browser_support.parseBrowser).forEach(function(plat) {
        kw.browser_min[plat.browser] = plat.version;
    });
    return kw;
}

describe('supportsDeclaration', function() {
    it('should return true when no mins have been provided', function() {
        assert(browser_support.supportsDeclaration('foo', {}));
    });
    it('should return true when the declaration is unrecognized', function() {
        assert(browser_support.supportsDeclaration('foo', getMins('ie1000,fx1000,chr1000')));
    });
    it('should return true when the declaration is recognized but all browser support the decl', function() {
        var kw = getMins('ie1,fx1,chr1');
        assert(browser_support.supportsDeclaration('-moz-border-radius', kw));
        assert.equal(crass.parse('a{-moz-border-radius:0}').optimize(kw).toString(), 'a{-moz-border-radius:0}');
    });
    it('should return false when the declaration is unrecognized by the selected browsers', function() {
        var kw = getMins('ie1,fx5,chr1');
        assert(!browser_support.supportsDeclaration('-moz-border-radius', kw));
        assert.equal(crass.parse('a{-moz-border-radius:0}').optimize(kw).toString(), '');
        assert.equal(crass.parse('a{-moz-border-radius:0;foo:bar}').optimize(kw).toString(), 'a{foo:bar}');
    });

    it('should handle ie5/6 hacks', function() {
        var oldIE = getMins('ie1,fx1,chr1');
        var newIE = getMins('ie7,fx1,chr1');
        assert(browser_support.supportsDeclaration('_font-face', oldIE));
        assert(!browser_support.supportsDeclaration('_font-face', newIE));
    });
});


describe('supportsKeyframe', function() {
    it('should return false for unrecognized browsers', function() {
        assert(browser_support.supportsKeyframe('-webkit-', getMins('ie1,fx1,chr1')));
    });
    it('should return false for unrelated browsers', function() {
        assert(browser_support.supportsKeyframe('-webkit-', getMins('ie1000,fx1,chr1')));
    });
    it('should return true for recognized browsers', function() {
        assert(!browser_support.supportsKeyframe('-webkit-', getMins('ie1,fx1,chr1000')));
    });
    it('should return false for known invalid prefixes', function() {
        assert(!browser_support.supportsKeyframe('-ms-', {}));
    });
});
