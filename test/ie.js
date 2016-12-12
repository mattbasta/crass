var assert = require('assert');

var crass = require('../src');

function parseString(data) {
    return crass.parse(data).toString();
}
function parity(data, expected) {
    assert.equal(crass.parse(data).toString(), expected || data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), expected || data);
}
function parityOpt(data, expected) {
    assert.equal(crass.parse(data).optimize({o1: true}).toString(), expected);
    assert.equal(crass.parse(crass.parse(data).optimize({o1: true}).pretty()).toString(), expected);
}
function paritySaveIE(data) {
    assert.equal(crass.parse(data).optimize({o1: true, saveie: true}).toString(), data);
    assert.equal(crass.parse(crass.parse(data).optimize({o1: true, saveie: true}).pretty()).toString(), data);
}


describe('filter', () => {
    var ie10_min = {browser_min: {ie: 10}};
    var ie9_min = {browser_min: {ie: 9}};

    it('can be vanilla', () => {
        assert.equal(parseString('a{filter:foo}'), 'a{filter:foo}');
    });
    it('can be short', () => {
        parity('a{filter:alpha(opacity=50)}');
    });
    it('can be old-style', () => {
        assert.equal(parseString('a{filter:progid:DXImageTransform.Microsoft.filtername(strength=50)}'), 'a{filter:progid:DXImageTransform.Microsoft.filtername(strength=50)}');
    });
    it('can have strings', () => {
        assert.equal(parseString('a{filter:progid:DXImageTransform.Microsoft.Iris(irisstyle=\'STAR\' duration=4)}'), 'a{filter:progid:DXImageTransform.Microsoft.Iris(irisstyle=\'STAR\' duration=4)}');
    });
    it('can have multiple progids', () => {
        assert.equal(
            parseString('a{filter:progid:DXImageTransform.Microsoft.MotionBlur(strength=50)\nprogid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)}'),
            'a{filter:progid:DXImageTransform.Microsoft.MotionBlur(strength=50)\nprogid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)}'
        );
    });
    it('can be prefixed', () => {
        assert.equal(parseString('a{-ms-filter: alpha(opacity=50)}'), 'a{-ms-filter: alpha(opacity=50)}');
    });

    it('is removed in IE10+', () => {
        assert.equal(crass.parse('a{filter:foo;zip:zap}').optimize(ie9_min).toString(), 'a{filter:foo;zip:zap}');
        assert.equal(crass.parse('a{filter:foo;zip:zap}').optimize(ie10_min).toString(), 'a{zip:zap}');
        assert.equal(crass.parse('a{filter:progid:DXBlahBlahBlah.foo.bar(lol=omg);zip:zap}').optimize(ie10_min).toString(), 'a{zip:zap}');
    });

    it('is removed when the -ms-filter variant is used in IE10', () => {
        var ie10_min = {browser_min: {ie: 10}};
        assert.equal(crass.parse('a{-ms-filter:foo;zip:zap}').optimize(ie10_min).toString(), 'a{zip:zap}');
    });

    it('is has whitespace stripped during optimization', () => {
        assert.equal(crass.parse('a{filter : foo;}').optimize({o1: true}).toString(), 'a{filter:foo}');
    });
});


describe('expressions', () => {
    it('can be vanilla', () => {
        parity('a{foo:expression(document.innerWidth)}');
    });
    it('are treated as terms', () => {
        assert.equal(parseString('a{foo:3px expression(document.innerWidth) auto}'), 'a{foo:3px expression(document.innerWidth) auto}');
    });
    it('can contain simple binops', () => {
        assert.equal(parseString('a{foo: expression(document.innerWidth > 6)}'), 'a{foo:expression(document.innerWidth > 6)}');
    });
    it('can contain maths', () => {
        assert.equal(parseString('a{foo: expression(document.innerWidth / 2 - foo.innerWidth / 2)}'), 'a{foo:expression(document.innerWidth / 2 - foo.innerWidth / 2)}');
    });
});


describe('slash 9', () => {
    it('is parsed', () => {
        parity('a{foo:bar\\9}');
        parity('a{foo:bar \\9}', 'a{foo:bar\\9}');
    });
    it('is ignored by default on optimizations', () => {
        parityOpt('a{foo:bar\\9}', '');
        paritySaveIE('a{foo:bar\\9}');
    });
});


describe('slash 0', () => {
    it('is parsed', () => {
        parity('a{foo:bar\\0}');
        parity('a{foo:bar \\0}', 'a{foo:bar\\0}');
    });
    it('is ignored by default on optimizations', () => {
        parityOpt('a{foo:bar\\0}', '');
        paritySaveIE('a{foo:bar\\0}');
    });
});


describe('star hack', () => {
    it('is ignored by default on optimizations', () => {
        parityOpt('a{*foo:bar}', '');
        paritySaveIE('a{*foo:bar}');
    });
});


describe('* html hack', () => {
    it('is ignored by default on optimizations', () => {
        parityOpt('* html{foo:bar}', '');
        paritySaveIE('* html{foo:bar}');
    });
    it('is ignored by default on optimizations with descendants', () => {
        parityOpt('* html foo{foo:bar}', '');
        paritySaveIE('* html foo{foo:bar}');
    });
    it('is ignored as part of a selector list by default on optimizations', () => {
        parityOpt('* html,bar{foo:bar}', 'bar{foo:bar}');
        paritySaveIE('* html,bar{foo:bar}');
    });
    it('is ignored as part of a selector list by default on optimizations with descendants', () => {
        parityOpt('* html foo,bar{foo:bar}', 'bar{foo:bar}');
        paritySaveIE('* html foo,bar{foo:bar}');
    });
});


describe('flexbox display values', () => {
    it('are ignored when no compat is specified', () => {
        var output = crass.parse('a{display:-ms-flexbox}').optimize().toString();
        assert.equal(output, 'a{display:-ms-flexbox}', 'should have been ignored');
    });
    it('are removed for ie10 and earlier', () => {
        var output = crass.parse('a{display:-ms-flexbox}').optimize({browser_min: {ie: 10}}).toString();
        assert.equal(output, 'a{display:-ms-flexbox}', 'should have been ignored');
    });
    it('are removed for ie11 and later', () => {
        var output = crass.parse('a{display:-ms-flexbox;color:red}').optimize({browser_min: {ie: 11}}).toString();
        assert.equal(output, 'a{color:red}', 'should have removed the value');
    });
});

describe('#ie8#hack', () => {
    it('should be removed', () => {
        assert.equal(
            crass.parse('#ie8#hack,a{b:c}').optimize().toString(),
            'a{b:c}'
        );
        assert.equal(
            crass.parse('#ie8#hack{b:c}').optimize().toString(),
            ''
        );
    });
    it('should be preserved when saveie is present', () => {
        assert.equal(
            crass.parse('#ie8#hack,a{b:c}').optimize({saveie: true}).toString(),
            '#ie8#hack,a{b:c}'
        );
        assert.equal(
            crass.parse('#ie8#hack{b:c}').optimize({saveie: true}).toString(),
            '#ie8#hack{b:c}'
        );
    });
});
