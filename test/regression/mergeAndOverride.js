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

    it('should not merge into an important shorthand', () => {
        assert.equal(
            crass.parse(`
            .box {
                margin: 0 !important;
            }
            .box {
                margin: 1px;
            }
            `).optimize({o1: true}).toString(),
            '.box{margin:0!important}'
        );
        assert.equal(
            crass.parse(`
            .box {
                margin: 0 !important;
                margin-top: 1px;
            }
            `).optimize({o1: true}).toString(),
            '.box{margin:0!important}'
        );
        assert.equal(
            crass.parse(`
            .box {
                margin-top: 1px;
                margin: 0 !important;
            }
            `).optimize({o1: true}).toString(),
            '.box{margin:0!important}'
        );
    });

    it('should not merge important longhand into unimportant shorthand', () => {
        assert.equal(
            crass.parse(`
            .box {
                margin: 0;
                margin-top: 1px !important;
            }
            `).optimize({o1: true}).toString(),
            '.box{margin:0;margin-top:1px!important}'
        );
        assert.equal(
            crass.parse(`
            .box {
                margin-top: 1px !important;
                margin: 0;
            }
            `).optimize({o1: true}).toString(),
            '.box{margin:0;margin-top:1px!important}'
        );
    });

    it('should perform partial merges into an important shorthand', () => {
        assert.equal(
            crass.parse(`
            .box {
                margin: 0 !important;
                margin-left: 2px !important;
                margin-top: 1px;
            }
            `).optimize({o1: true}).toString(),
            '.box{margin:0 0 0 2px!important}'
        );
        assert.equal(
            crass.parse(`
            .box {
                margin-top: 1px;
                margin-left: 2px !important;
                margin: 0 !important;
            }
            `).optimize({o1: true}).toString(),
            '.box{margin:0!important}' // margin-left is overriden by the shorthand "naturally"
        );
    });

    it('should not do distant merges without preserving !important', () => {
        assert.equal(
            crass.parse(`
            a { left: 0 !important; }
            div { color: red; }
            a { left: 1px; }
            `).optimize({o1: true}).toString(),
            'a{left:0!important}div{color:red}a{left:1px}'
        );
    });

});
