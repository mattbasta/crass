var assert = require('assert');

var crass = require('../src');
var parseString = function(data, o1) {
    var params = {};
    if (o1) params.o1 = true;
    return crass.parse(data).optimize(params).toString();
};

describe('Length', function() {
    it('should convert in', function() {
        assert.equal(parseString('a{width:96px}'), 'a{width:1in}');
    });
    it('should convert pc', function() {
        assert.equal(parseString('a{width:16px}'), 'a{width:1pc}');
    });
    it('should convert pt', function() {
        assert.equal(parseString('a{width:12pt}'), 'a{width:1pc}');
    });
    it('should convert cm', function() {
        // Only on O1
        assert.equal(parseString('a{width:37.79px}', true), 'a{width:1cm}');
    });
    it('should convert mm', function() {
        // Only on O1
        assert.equal(parseString('a{width:11.337px}', true), 'a{width:3mm}');
    });
    it('should convert cm', function() {
        // Only on O1
        assert.equal(parseString('a{width:1.0007cm}', true), 'a{width:.3939in}');
        assert.equal(parseString('a{width:1.0007cm}'), 'a{width:1.0007cm}');
    });
    it('should convert mm', function() {
        // Only on O1
        assert.equal(parseString('a{width:1.0007mm}', true), 'a{width:.1cm}');
        assert.equal(parseString('a{width:1.0007mm}'), 'a{width:1.0007mm}');
    });
    it('should convert q', function() {
        // Only on O1
        assert.equal(parseString('a{width:1mm}', true), 'a{width:4q}');
        assert.equal(parseString('a{width:1mm}'), 'a{width:1mm}');
    });
});


describe('Angles', function() {
    it('should convert grad', function() {
        assert.equal(parseString('a{transform:rotate(100grad)}'), 'a{transform:rotate(90deg)}');
    });
    it('should convert rad', function() {
        assert.equal(parseString('a{transform:rotate(6.283186rad)}'), 'a{transform:rotate(360deg)}');
    });
    it('should convert deg', function() {
        assert.equal(parseString('a{transform:rotate(7.2deg)}'), 'a{transform:rotate(8grad)}');
    });
});


describe('Temporal', function() {
    it('should convert s', function() {
        assert.equal(parseString('a{transition:all 5000ms}'), 'a{transition:all 5s}');
    });
    it('should convert ms', function() {
        assert.equal(parseString('a{transition:all .005s}'), 'a{transition:all 5ms}');
    });
});


describe('Frequency', function() {
    it('should convert Hz', function() {
        assert.equal(parseString('a{foo:5000Hz}'), 'a{foo:5kHz}');
    });
    it('should convert kHz', function() {
        assert.equal(parseString('a{foo:.005kHz}'), 'a{foo:5Hz}');
    });
});


describe('Resolution', function() {
    it('should convert dpi', function() {
        assert.equal(parseString('a{foo:1dpi}'), 'a{foo:1dpi}');
    });
    it('should convert dpcm', function() {
        assert.equal(parseString('a{foo:2.54dpcm}'), 'a{foo:1dpi}');
    });
    it('should convert dppx', function() {
        assert.equal(parseString('a{foo:96dppx}'), 'a{foo:1dpi}');
    });
});


describe('Zero', function() {
    it('should drop units for length', function() {
        assert.equal(parseString('a{foo:0px}'), 'a{foo:0}');
        assert.equal(parseString('a{foo:0em}'), 'a{foo:0}');
    });
    it('should not drop units for non-length', function() {
        assert.equal(parseString('a{foo:0s}'), 'a{foo:0s}');
        assert.equal(parseString('a{foo:0deg}'), 'a{foo:0deg}');
    });
});
