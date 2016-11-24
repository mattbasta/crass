var assert = require('assert');

var crass = require('../crass');
var parseString = function(data) {
    return crass.parse(data).toString();
};


describe('@charset', function() {
    it('should parse valid @charset blocks', function() {
        assert.equal(parseString('@charset "utf-8";'),
                     '@charset "utf-8";');
    });

    it('should pretty print charsets', function() {
        assert.equal(
            crass.parse('@charset "utf-8";').pretty(),
            '@charset "utf-8";\n'
        );
    });

    it('should have no optimizations', function() {
        assert.equal(
            crass.parse('@charset "utf-8";').optimize().toString(),
            '@charset "utf-8";'
        );
    });
});
