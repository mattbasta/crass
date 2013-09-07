var assert = require("assert");

var crass = require('../crass');

var filler = 'a{x:y}';
var parity = function(data) {
	data = data.replace(/\$\$/g, filler);
	assert.equal(crass.parse(data).toString(), data);
}


describe('@media', function() {
    it('should parse media types', function() {
        parity('@media screen{$$}');
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
});

describe('nested @media', function() {
    it('should parse properly', function() {
        parity('@media screen{@media (min-width:450px){$$}}');
    });
});
