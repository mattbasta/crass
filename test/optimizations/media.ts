import * as assert from 'assert';
const crass = require('../../src');

const parseString = function(data, kw) {
    return crass.parse(data).optimize(kw || {}).toString();
};
const parseCompare = function(data, expected, kw) {
    if (kw) {
        if (kw.o1 && data !== expected) {
            assert.notEqual(parseString(data), expected);
        }
        assert.equal(parseString(data, kw), expected);
        assert.equal(parseString(crass.parse(data).pretty(), kw), expected);
    } else {
        assert.equal(parseString(data), expected);
    }
};


describe('media block optimizer', () => {

    it('should combine adjacent media blocks', () => {
        parseCompare(
            '@media(max-width: 123){foo{a:b}}@media(max-width: 123){bar{c:d}}',
            '@media(max-width:123){foo{a:b}bar{c:d}}'
        );
    });
    it('should optimize after combining media blocks', () => {
        parseCompare(
            '@media(max-width: 123){foo{a:b}}@media(max-width: 123){bar{a:b}}',
            '@media(max-width:123){bar,foo{a:b}}'
        );
    });

});
