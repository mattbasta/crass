import * as assert from 'assert';
const crass = require('../../src');


const origURI = 'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ1MSA0NTEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1MSA0NTE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNNDQ3LjA1LDQyOGwtMTA5LjYtMTA5LjZjMjkuNC0zMy44LDQ3LjItNzcuOSw0Ny4yLTEyNi4xQzM4NC42NSw4Ni4yLDI5OC4zNSwwLDE5Mi4zNSwwQzg2LjI1LDAsMC4wNSw4Ni4zLDAuMDUsMTkyLjNzODYuMywxOTIuMywxOTIuMywxOTIuM2M0OC4yLDAsOTIuMy0xNy44LDEyNi4xLTQ3LjJMNDI4LjA1LDQ0N2MyLjYsMi42LDYuMSw0LDkuNSw0czYuOS0xLjMsOS41LTRDNDUyLjI1LDQ0MS44LDQ1Mi4yNSw0MzMuMiw0NDcuMDUsNDI4eiBNMjYuOTUsMTkyLjNjMC05MS4yLDc0LjItMTY1LjMsMTY1LjMtMTY1LjNjOTEuMiwwLDE2NS4zLDc0LjIsMTY1LjMsMTY1LjNzLTc0LjEsMTY1LjQtMTY1LjMsMTY1LjRDMTAxLjE1LDM1Ny43LDI2Ljk1LDI4My41LDI2Ljk1LDE5Mi4zeiIvPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48L3N2Zz4=)';
const optimizedURI = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NTEgNDUxIj48cGF0aCBkPSJNNDQ3LjA1IDQyOGwtMTA5LjYtMTA5LjZjMjkuNC0zMy44IDQ3LjItNzcuOSA0Ny4yLTEyNi4xQzM4NC42NSA4Ni4yIDI5OC4zNSAwIDE5Mi4zNSAwIDg2LjI1IDAgLjA1IDg2LjMuMDUgMTkyLjNzODYuMyAxOTIuMyAxOTIuMyAxOTIuM2M0OC4yIDAgOTIuMy0xNy44IDEyNi4xLTQ3LjJMNDI4LjA1IDQ0N2MyLjYgMi42IDYuMSA0IDkuNSA0czYuOS0xLjMgOS41LTRjNS4yLTUuMiA1LjItMTMuOCAwLTE5ek0yNi45NSAxOTIuM2MwLTkxLjIgNzQuMi0xNjUuMyAxNjUuMy0xNjUuMyA5MS4yIDAgMTY1LjMgNzQuMiAxNjUuMyAxNjUuM3MtNzQuMSAxNjUuNC0xNjUuMyAxNjUuNGMtOTEuMSAwLTE2NS4zLTc0LjItMTY1LjMtMTY1LjR6Ii8+PC9zdmc+)';

const regression1 = `
.has-svg:before {
    content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='-0.5 0 20 15'><rect fill='white' stroke='none' transform='rotate(45 4.0033 8.87436)' height='5' width='6.32304' y='6.37436' x='0.84178'></rect><rect fill='white' stroke='none' transform='rotate(45 11.1776 7.7066)' width='5' height='16.79756' y='-0.69218' x='8.67764'></rect></svg>");
}
`;

function optimize(x, kw) {
    return crass.parse(x).optimize(kw).toString();
}


describe('minify SVG', () => {
    it('should not minify SVGs without O1', () => {
        assert.equal(
            optimize(`a{foo:${origURI}}`),
            `a{foo:${origURI}}`,
            'Should be unchanged'
        );
    });
    it('should minify SVGs with O1', () => {
        assert.equal(
            optimize(`a{foo:${origURI}}`, {o1: true}),
            `a{foo:${optimizedURI}}`,
            'Should be minified'
        );
    });
    it('should handle the regression test', () => {
        assert.ok(optimize(regression1, {o1: true}));
    });
});
