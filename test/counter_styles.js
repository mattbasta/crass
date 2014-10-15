var assert = require('assert');

var crass = require('../crass');

var filler = 'a:b;c:d';
var parity = function(data) {
    data = data.replace(/\$\$/g, filler);
    assert.equal(crass.parse(data).toString(), data);
    assert.equal(crass.parse(crass.parse(data).pretty()).toString(), data);
};


describe('@counter-styles', function() {
    it('should parse blocks', function() {
        parity('@counter-style foo{$$}');
    });

    it('should optimize declarations', function() {
        assert.equal(
            crass.parse('@counter-style foo{a:first;a:first;}').optimize({o1: true}).toString(),
            '@counter-style foo{a:first}'
        );
    });

});
