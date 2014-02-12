var assert = require("assert");

var crass = require('../crass');
var parseString = function(data) {
    return crass.parse(data).toString();
};


describe('@charset', function() {
    it('should parse valid @charset blocks', function() {
        assert.equal(parseString('@charset "utf-8";'),
                     '@charset "utf-8";');
    });
});
