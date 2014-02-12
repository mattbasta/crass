var assert = require("assert");

var crass = require('../crass');
var parseString = function(data) {
    return crass.parse(data).toString();
};


describe('@import', function() {
    it('should parse @import blocks with strings', function() {
        assert.equal(parseString('@import "foo.css";'),
                     '@import "foo.css";');
    });
    it('should parse @import blocks with junk before the semicolon', function() {
        assert.equal(parseString('@import "foo.css"   \n;'),
                     '@import "foo.css";');
    });
    it('should parse @import blocks with URIs', function() {
        assert.equal(parseString('@import url("foo.css");'),
                     '@import "foo.css";');
    });
    it('should parse @import blocks with URIs that require uri blocks', function() {
        assert.equal(parseString('@import url(valid/url"foo.css".foo);'),
                     '@import \'valid/url"foo.css".foo\';');
    });
});
