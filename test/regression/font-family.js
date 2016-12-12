const assert = require('assert');

const crass = require('../../src');


describe('font-family', () => {

    it('should strip quotes', () => {
        assert.equal(
            crass.parse('a{font-family:"Roboto Sans",sans-serif}').optimize().toString(),
            'a{font-family:Roboto Sans,sans-serif}'
        );
    });
    it('should not strip quotes on fonts with keywords in the name', () => {
        assert.equal(
            crass.parse('a{font-family:"Roboto Serif",sans-serif}').optimize().toString(),
            'a{font-family:"Roboto Serif",sans-serif}'
        );
    });
    it('should escape spaces preceding digits', () => {
        assert.equal(
            crass.parse('a{font-family:"Basta 1234",sans-serif}').optimize().toString(),
            'a{font-family:Basta\\ 1234,sans-serif}'
        );
        assert.equal(
            crass.parse('a{font-family:"Basta 1 2 3 4",sans-serif}').optimize().toString(),
            'a{font-family:"Basta 1 2 3 4",sans-serif}'
        );
    });

});
