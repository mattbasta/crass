const assert = require('assert');

const crass = require('../../src');


describe('merge and override', () => {

    it('should not override with !important', () => {
        assert.equal(
            crass.parse(`
            a {
                padding-bottom: bottom !important;
                padding: 0 1 2 3;
            }
            `).optimize({o1: true}).toString(),
            'a{padding:0 1 2 3;padding-bottom:bottom!important}'
        );
        assert.equal(
            crass.parse(`
            a {
                padding: 0 1 2 3;
                padding-bottom: bottom !important;
            }
            `).optimize({o1: true}).toString(),
            'a{padding:0 1 2 3;padding-bottom:bottom!important}'
        );
        assert.equal(
            crass.parse(`
            a {
                padding: 0 1 2 3;
            }
            a {
                padding-bottom: bottom !important;
            }
            `).optimize({o1: true}).toString(),
            'a{padding:0 1 2 3;padding-bottom:bottom!important}'
        );
    });

    it('should override correctly', () => {
        assert.equal(
            crass.parse(`
            a {
                padding: 0 1 2 3;
                padding-bottom: bottom;
            }
            `).optimize({o1: true}).toString(),
            'a{padding:0 1 bottom 3}'
        );
    });

    it('should merge correctly', () => {
        assert.equal(
            crass.parse(`
            a {
                padding: 0 1 2 3;
            }
            a {
                padding-bottom: bottom;
            }
            `).optimize({o1: true}).toString(),
            'a{padding:0 1 bottom 3}'
        );
    });

});
