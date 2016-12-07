var assert = require('assert');

var crass = require('../src');
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
    it('should parse @import blocks with mediums', function() {
        assert.equal(parseString('@import "foo.css" screen;'),
                     '@import "foo.css" screen;');
    });

    it('should pretty print', function() {
        assert.equal(
            crass.parse('@import "foo.css";').pretty(),
            '@import "foo.css";\n'
        );
    });

    it('should have no optimizations', function() {
        assert.equal(
            crass.parse('@import "foo.css";').optimize().toString(),
            '@import "foo.css";'
        );
    });
});
