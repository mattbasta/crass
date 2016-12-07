var assert = require('assert');

var crass = require('../src');


describe('Comments', function() {
    it('should parse properly', function() {
        assert.equal(
            crass.parse('/*foo*/').toString(),
            ''
        );
        assert.equal(
            crass.parse('/*! foo !*/').toString(),
            ''
        );
        assert.equal(
            crass.parse('/*! * Bootstrap v3.\n*/').toString(),
            ''
        );
    });
});
