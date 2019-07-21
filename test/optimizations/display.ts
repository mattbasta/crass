import * as assert from 'assert';
const crass = require('../../src');


const rules = [
    ['none', 'none'],
    ['contents', 'contents'],
    ['block', 'block flow'],
    ['flow-root', 'block flow-root'],
    ['inline', 'inline flow'],
    ['inline-block', 'inline flow-root'],
    ['run-in', 'run-in flow'],
    ['list-item', 'list-item block flow'],
    ['inline-list-item', 'list-item inline flow'],
    ['flex', 'block flex'],
    ['inline-flex', 'inline flex'],
    ['grid', 'block grid'],
    ['inline-grid', 'inline grid'],
    ['ruby', 'inline ruby'],
    ['block ruby', 'block ruby'],
    ['table', 'block table'],
    ['inline-table', 'inline table'],
    ['table-cell', 'table-cell flow'],
    ['table-caption', 'table-caption flow'],
    ['ruby-base', 'ruby-base flow'],
    ['ruby-text', 'ruby-text flow'],
];

describe('reduce display values', () => {

    rules.forEach(rule => {
        const output = rule[0];
        const input = rule[1];
        it(`'display: ${input}' should become 'display: ${output}'`, () => {
            assert.equal(
                crass.parse(`a{display:${input}}`).optimize().toString(),
                `a{display:${output}}`
            );
        });
    });
});
