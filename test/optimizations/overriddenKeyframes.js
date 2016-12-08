const assert = require('assert');

const crass = require('../../src');


function optimize(x) {
    return crass.parse(x).optimize().toString();
}


describe('remove overridden keyframe blocks', () => {
    it('should remove blocks that are overridden', () => {
        assert.equal(
            optimize(`
                @keyframes foo {
                    from{color: red}
                    to{color: blue}
                }
                @keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
            `),
            optimize(`
                @keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
            `),
            'Duplicate keyframe should have been removed'
        );
    });
    it('should remove prefixed blocks that are overridden', () => {
        assert.equal(
            optimize(`
                @-webkit-keyframes foo {
                    from{color: red}
                    to{color: blue}
                }
                @-webkit-keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
            `),
            optimize(`
                @-webkit-keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
            `),
            'Duplicate keyframe should have been removed'
        );
    });
    it('should ignore duplicate blocks with different prefixes', () => {
        const out = optimize(`
            @-webkit-keyframes foo {
                from{color: red}
                to{color: blue}
            }
            @-o-keyframes foo {
                from{color: blue}
                to{color: red}
            }
        `);
        assert.ok(out.indexOf('-webkit-') > -1);
        assert.ok(out.indexOf('-o-') > -1);
    });
    it('should deduplicate blocks with different prefixes', () => {
        assert.equal(
            optimize(`
                @-webkit-keyframes foo {
                    from{color: red}
                    to{color: blue}
                }
                @-o-keyframes foo {
                    from{color: red}
                    to{color: blue}
                }
                @-webkit-keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
                @-o-keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
            `),

            optimize(`
                @-webkit-keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
                @-o-keyframes foo {
                    from{color: blue}
                    to{color: red}
                }
            `),
            'Should have removed the overridden ones'
        );
    });
});
