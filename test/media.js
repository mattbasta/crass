var assert = require('assert');

var crass = require('../src');

var filler = 'a{x:y}';
var parity = function(data) {
    data = data.replace(/\$\$/g, filler);
    assert.equal(crass.parse(data).toString(), data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), data);
}
function parityOpt(data, expected) {
    assert.equal(crass.parse(data).optimize({}).toString(), expected);
    assert.equal(crass.parse(crass.parse(data).optimize({}).pretty()).toString(), expected);
}
function paritySaveIE(data) {
    assert.equal(crass.parse(data).optimize({saveie: true}).toString(), data);
    assert.equal(crass.parse(crass.parse(data).optimize({saveie: true}).pretty()).toString(), data);
}


describe('@media', function() {
    it('should parse media types', function() {
        parity('@media screen{$$}');
    });

    it('should parse empty media queries', function() {
        parity('@media only screen{}');
        parity('@media only screen and (min-width:769px) and (max-width:1024px){}');
        parity('@media only screen and (min-width:1025px){}');
        parity('@media only screen and (min-width:321px) and (max-width:480px){}');
    });

    it('should parse multiple media types', function() {
        parity('@media mobile,screen{$$}');
    });

    it('should parse media with constraint', function() {
        parity('@media screen and (color){$$}');
    });

    it('should parse media with constraint and value', function() {
        parity('@media screen and (min-width:450px){$$}');
    });

    it('should parse multiple media types with constraint and value', function() {
        parity('@media mobile and (color),screen and (min-width:450px){$$}');
    });

    it('should parse media with only a constraint', function() {
        parity('@media (min-width:450px){$$}');
    });

    it('should parse media block with no media type', function() {
        parity('@media (min-width:768px) and (max-width:991px){$$}');
    });

    it('should parse media with prefixes', function() {
        parity('@media only screen{$$}');
        parity('@media not screen{$$}');
        parity('@media not screen and (min-width:450px){$$}');
        parity('@media mobile,not screen{$$}');
    });

    it('should parse media with weird constraints', function() {
        parity('@media only screen and (-webkit-min-device-pixel-ratio:2){$$}');
    });

    it('should optimize media expressions', function() {
        assert.equal(
            crass.parse('@media (min-width:12pt){x{y:z}}').optimize().toString(),
            '@media (min-width:1pc){x{y:z}}'
        );
    });

    describe('nested @media', function() {
        it('should parse properly', function() {
            parity('@media screen{@media (min-width:450px){$$}}');
        });
    });


    describe('with @page', function() {
        it('should parse properly', function() {
            parity('@media screen{@page{margin:auto}}');
        });
    });

    describe('slash 0', function() {
        var example = '@media (min-width:0\\0){x{y:z}}';
        it('is parsed', function() {
            parity(example);
        });
        it('is removed when a min version of IE is set', function() {
            var min = {ie: 10};
            assert.equal(crass.parse(example).optimize({browser_min: min}).toString(), '');
            assert.equal(
                crass.parse(crass.parse(example).optimize({browser_min: min}).pretty()).toString(),
                ''
            );
        });
    });

});

