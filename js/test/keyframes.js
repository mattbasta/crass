var assert = require("assert");

var crass = require('../crass');

var filler = 'from{x:y}to{a:b}';
var parity = function(data) {
	data = data.replace(/\$\$/g, filler);
	assert.equal(crass.parse(data).toString(), data);
}


describe('@keyframes', function() {
    it('should parse keyframes blocks', function() {
        parity('@keyframes foo{$$}');
    });
    it('should parse keyframes blocks with a prefix', function() {
        parity('@-webkit-keyframes foo{$$}');
    });
});
