const assert = require('assert');

const crass = require('../../src');

const parseString = (data, kw) => {
    return crass.parse(data).optimize(kw || {}).toString();
};
const parseCompare = (data, expected, kw) => {
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


describe('Merge late longhand into early shorthand', () => {
    it('should collapse basic quad lists', () => {
        parseCompare(
            `
            a {
                padding: top right bottom left;
                padding-bottom: foo;
            }
            `,
            'a{padding:top right foo left}'
        );
    });

    it('should expand quad lists if needed', () => {
        parseCompare(
            `
            a {
                padding: all;
                padding-top: top;
            }
            `,
            'a{padding:top all all}'
        );
        parseCompare(
            `
            a {
                padding: all;
                padding-right: right;
            }
            `,
            'a{padding:all right all all}'
        );
        parseCompare(
            `
            a {
                padding: all;
                padding-bottom: bottom;
            }
            `,
            'a{padding:all all bottom}'
        );
        parseCompare(
            `
            a {
                padding: all;
                padding-left: left;
            }
            `,
            'a{padding:all all all left}'
        );
    });

    it('should merge borders based on direction', () => {
        parseCompare(
            `
            a {
                border: 1px solid red;
                border-left: 1px solid red;
            }
            `,
            'a{border:1px solid red}'
        );
    });

    it('should merge borders based on component', () => {
        parseCompare(
            `
            a {
                border: 1px solid red;
                border-color: new-color;
            }
            `,
            'a{border:1px solid new-color}'
        );
    });

    it('should merge border-radius in the happy case', () => {
        parseCompare(
            `
            a {
                border-radius: all;
                border-top-left-radius: tlr;
            }
            `,
            'a{border-radius:tlr all all}'
        );
        parseCompare(
            `
            a {
                border-radius: all;
                border-top-right-radius: trr;
            }
            `,
            'a{border-radius:all trr all all}'
        );
        parseCompare(
            `
            a {
                border-radius: all;
                border-bottom-left-radius: blr;
            }
            `,
            'a{border-radius:all all all blr}'
        );
        parseCompare(
            `
            a {
                border-radius: all;
                border-bottom-right-radius: brr;
            }
            `,
            'a{border-radius:all all brr}'
        );
    });

    it('should merge border-radius in the complex case', () => {
        parseCompare(
            `
            a {
                border-radius: x/y;
                border-top-left-radius: tlr;
            }
            `,
            'a{border-radius:tlr x x/tlr y y}'
        );
        parseCompare(
            `
            a {
                border-radius: x/y;
                border-top-left-radius: a/b;
            }
            `,
            'a{border-radius:a x x/b y y}'
        );
    });
});
