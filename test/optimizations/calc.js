const assert = require('assert');

const crass = require('../../src');

const parseString = function(data, kw) {
    return crass.parse(data).optimize(kw || {}).toString();
};
const parseCompare = function(dataRaw, expectedRaw, kw) {
    const data = `a{b:${dataRaw}}`;
    const expected = expectedRaw ? `a{b:${expectedRaw}}` : '';
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


describe('calc()', () => {

    it('should reduce simple math', () => {
        parseCompare('calc(1 + 1)', '2');
        parseCompare('calc(1 - 1)', '0');
        parseCompare('calc(2 * 2)', '4');
        parseCompare('calc(8 / 2)', '4');
        parseCompare('calc((6 / 2) - (4 * 2) + 1)', '-4');
    });

    it('should reduce expressions with a single unit', () => {
        parseCompare('calc(3px * 2 - 1px)', '5px');
        parseCompare('calc(3rem * 2 - 1rem)', '5rem');
        parseCompare('calc(3em * 2 - 1em)', '5em');
        parseCompare('calc(3pt * 2 - 1pt)', '5pt');
        parseCompare('calc(3vh * 2 - 1vh)', '5vh');
    });

    it('should multiply percentages', () => {
        parseCompare('calc(2 * 50%)', '100%');
        parseCompare('calc(120% * 50%)', '60%');
    });

    it('should handle Hz and kHz', () => {
        parseCompare('calc(2 * 50kHz)', '100kHz');
        parseCompare('calc(2 * 50Hz)', '100Hz');
    });

    it('should drop invalid calculations', () => {
        parseCompare('calc(2px + 3s)', '');
        parseCompare('calc(2em + 4kHz)', '');
        parseCompare('calc(2rem * (2 * (2 + 3)) + 4 + (5/2))', '');
        parseCompare('calc((4 * 2) + 4.2 + 1 + (2rem * .4) + (2px * .4))', '');
    });

    it('should ignore unrecognized units', () => {
        parseCompare('calc(2px + 3vm)', 'calc(2px + 3vm)'); // vm is IE's version of vmin
    });

    it('should handle complex expressions', () => {
        parseCompare('calc(calc(100 + 10) + 1)', '111');
        parseCompare('calc(calc(calc(1rem * 0.75) * 1.5) - 1rem)', '.125rem');
        parseCompare('calc(calc(calc(1rem * 0.75) * 1.5) - 1px)', 'calc(1.125rem - 1px)');
        parseCompare('calc(((1rem * 0.75) * 1.5) - 1px)', 'calc(1.125rem - 1px)');
        parseCompare('calc(-1px + (1.5 * (1rem * 0.75)))', 'calc(-1px + 1.125rem)');
        parseCompare('calc((2 * 100) / 12)', '16.6666');
        parseCompare('calc((100 / 12) * 2)', '16.6666');
        parseCompare('calc(50% - 50vw + (100vw - 100vw) / 2 + 1em)', 'calc(50% - 50vw + 0 + 1em)');
    });

});
