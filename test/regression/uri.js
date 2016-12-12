const assert = require('assert');

const crass = require('../../src');


describe('URIs', () => {

    it('should not get all effed up', () => {
        assert.equal(
            crass.parse('a{foo:url("http://mysite.com/images/featured_(for_homepage)/1.jpg")}').optimize({o1: true}).toString(),
            'a{foo:url("http://mysite.com/images/featured_(for_homepage)/1.jpg")}'
        );
    });

    it('should escape spaces', () => {
        assert.equal(
            crass.parse('a{foo:url("http://mysite.com/images/foo bar.jpg")}').optimize({o1: true}).toString(),
            'a{foo:url(http://mysite.com/images/foo\\ bar.jpg)}'
        );
    });

    it('should trim URLs', () => {
        assert.equal(
            crass.parse('a{foo:url("    foo.jpg")}').optimize({o1: true}).toString(),
            'a{foo:url(foo.jpg)}'
        );
        assert.equal(
            crass.parse('a{foo:url("    fo o.jpg")}').optimize({o1: true}).toString(),
            'a{foo:url(fo\\ o.jpg)}'
        );
    });

});
