const assert = require('assert');

const crass = require('../../src');


describe('URIs', () => {

    it('should not get all effed up', () => {
        assert.equal(
            crass.parse('a{foo:url("http://mysite.com/images/featured_(for_homepage)/1.jpg")}').optimize({o1: true}).toString(),
            'a{foo:url("http://mysite.com/images/featured_(for_homepage)/1.jpg")}'
        );
    });

});
