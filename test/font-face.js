var assert = require("assert");

var crass = require('../crass');

var filler = 'src:"";foo:bar';
var parity = function(data) {
	data = data.replace(/\$\$/g, filler);
	assert.equal(crass.parse(data).toString(), data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), data);
}


describe('@font-face', function() {
    it('should parse font-face blocks', function() {
        parity('@font-face{$$}');
    });
    it('should optimize', function() {
        assert.equal(
            crass.parse('@font-face{font-weight:bold}').optimize().toString(),
            '@font-face{font-weight:700}'
        );
    });
});
