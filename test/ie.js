var assert = require("assert");

var crass = require('../crass');
var parseString = function(data) {
    return crass.parse(data).toString();
};
var parity = function(data, expected) {
    assert.equal(crass.parse(data).toString(), expected || data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), expected || data);
}


describe('filter', function() {
    it('can be vanilla', function() {
        assert.equal(parseString('a{filter:foo}'), 'a{filter:foo}');
    });
    it('can be short', function() {
        assert.equal(parseString('a{filter: alpha(opacity=50)}'), 'a{filter: alpha(opacity=50)}');
    });
    it('can be old-style', function() {
        assert.equal(parseString('a{filter:progid:DXImageTransform.Microsoft.filtername(strength=50)}'), 'a{filter:progid:DXImageTransform.Microsoft.filtername(strength=50)}');
    });
    it('can have strings', function() {
        assert.equal(parseString('a{filter:progid:DXImageTransform.Microsoft.Iris(irisstyle=\'STAR\' duration=4)}'), 'a{filter:progid:DXImageTransform.Microsoft.Iris(irisstyle=\'STAR\' duration=4)}');
    });
    it('can have multiple progids', function() {
        assert.equal(
            parseString('a{filter:progid:DXImageTransform.Microsoft.MotionBlur(strength=50)\nprogid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)}'),
            'a{filter:progid:DXImageTransform.Microsoft.MotionBlur(strength=50)\nprogid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)}'
        );
    });
    it('can be prefixed', function() {
        assert.equal(parseString('a{-ms-filter: alpha(opacity=50)}'), 'a{-ms-filter: alpha(opacity=50)}');
    });

    it('is removed in IE10+', function() {
        var ie10_min = {browser_min: {ie: 10}};
        assert.equal(crass.parse('a{filter:foo;zip:zap}').optimize(ie10_min).toString(), 'a{zip:zap}');
        assert.equal(crass.parse('a{filter:progid:DXBlahBlahBlah.foo.bar(lol=omg);zip:zap}').optimize(ie10_min).toString(), 'a{zip:zap}');
    });

    it('is removed when the -ms-filter variant is used in IE10', function() {
        var ie10_min = {browser_min: {ie: 10}};
        assert.equal(crass.parse('a{-ms-filter:foo;zip:zap}').optimize(ie10_min).toString(), 'a{zip:zap}');
    });
});


describe('expressions', function() {
    it('can be vanilla', function() {
        assert.equal(parseString('a{foo: expression(document.innerWidth)}'), 'a{foo:expression(document.innerWidth)}');
    });
    it('are treated as terms', function() {
        assert.equal(parseString('a{foo:3px expression(document.innerWidth) auto}'), 'a{foo:3px expression(document.innerWidth) auto}');
    });
    it('can contain simple binops', function() {
        assert.equal(parseString('a{foo: expression(document.innerWidth > 6)}'), 'a{foo:expression(document.innerWidth > 6)}');
    });
    it('can contain maths', function() {
        assert.equal(parseString('a{foo: expression(document.innerWidth / 2 - foo.innerWidth / 2)}'), 'a{foo:expression(document.innerWidth / 2 - foo.innerWidth / 2)}');
    });
});


describe('slash 9', function() {
    it('is parsed', function() {
        parity('a{foo:bar\\9}');
        parity('a{foo:bar \\9}', 'a{foo:bar\\9}');
    });
});
