import * as assert from 'assert';
const crass = require('../../src');


function doesNotChange(data) {
    const pretty = crass.parse(data).optimize().pretty();
    const optPretty = crass.parse(data).optimize({o1: true}).pretty();
    assert.equal(optPretty, pretty);
}

function changes(data, expected) {
    const expectedPretty = crass.parse(expected).optimize().pretty();
    const optPretty = crass.parse(data).optimize({o1: true}).pretty();
    assert.equal(optPretty, expectedPretty);
}


describe('Ruleset merging', () => {
    it('should happen for adjacent rulesets', () => {
        changes(
            'a{font-weight:bold}b{font-weight:bold}',
            'a,b{font-weight:bold}'
        );
    });

    it('should happen for nearby rulesets', () => {
        changes(
            'a{font-weight:bold}c{color:red}b{font-weight:bold}',
            'a,b{font-weight:bold}c{color:red}'
        );
    });

    it('should happen for nearby rulesets with nonconflicting IDs', () => {
        changes(
            'a{font-weight:bold}#c{color:red}#b{font-weight:bold}',
            'a,#b{font-weight:bold}#c{color:red}'
        );
    });

    it('should happen for nearby rulesets with nonconflicting attribute selectors', () => {
        changes(
            'a{font-weight:bold}[data-x=foo]{color:red}[data-x=bar]{font-weight:bold}',
            'a,[data-x=bar]{font-weight:bold}[data-x=foo]{color:red}'
        );
    });

    it('should not happen for rulesets separated by @media', () => {
        doesNotChange(
            'a{font-weight:bold}@media screen{c{color:red}}b{font-weight:bold}'
        );
    });

    it('should not happen for rulesets separated by elements that may match the latter element', () => {
        doesNotChange(
            'a{font-weight:bold}.this-is-a-class{color:red}b{font-weight:bold}'
        );
    });

    it('should not happen for rulesets separated by elements that may match the latter element by ID', () => {
        doesNotChange(
            'a{font-weight:bold}#b{color:red}b{font-weight:bold}'
        );
    });

    it('should not happen for rulesets separated by elements that may match the latter element by attribute', () => {
        doesNotChange(
            'a{font-weight:bold}[c=y]{color:red}[b=x]{font-weight:bold}'
        );
        doesNotChange(
            'a{font-weight:bold}[c]{color:red}[c=foo]{font-weight:bold}'
        );
    });

});
