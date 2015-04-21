var assert = require("assert");

var crass = require('../crass');

var filler = 'a{a:b;x:y}';
var parity = function(data) {
    data = data.replace(/\$\$/g, filler);
    assert.equal(crass.parse(data).toString(), data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), data);
}


describe('@-viewport', function() {
    it('should parse basic viewport block', function() {
        parity('@viewport{x:y}');
    });
    it('should parse basic vendor-prefixed viewport block', function() {
        parity('@-ms-viewport{x:y}');
    });


    it('should optimize contents', function() {
        assert.equal(
            crass.parse('@viewport{x:y;x:y}').optimize().toString(),
            '@viewport{x:y}'
        );
    });
    it('should optimize away vendor prefixes', function() {
        assert.equal(
            crass.parse('@-ms-viewport{-webkit-x:y;}').optimize().toString(),
            ''
        );
    });

});
