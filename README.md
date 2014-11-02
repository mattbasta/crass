# crass

A CSS3 utility library for JS.

[![Build Status](https://travis-ci.org/mattbasta/crass.png?branch=master)](https://travis-ci.org/mattbasta/crass)

## API

```js

var crass = require('crass');

// Parse any valid CSS stylesheet:
var parsed = crass.parse('b {font-weight: bold;}');

// Optimize the stylesheet:
parsed = parsed.optimize();

// Pretty print the stylesheet:
console.log(parsed.pretty());

// Print a minified version of the stylesheet:
console.log(parsed.toString());

```

Improvements on the API will be made in the future.

## Command Line Interface

If you `npm install -g crass`, you'll get `crass` on your PATH.

```bash
crass input.css [--optimize [--O1]] [--min x,y,z] [--pretty]
```

## Minification

Outputting a crass object as a string will perform the equivalent of most CSS minification tools. The corresponding styles are output in the minimum amount of CSS possible, without any whitespace.

Some minifiers also perform basic replacement and removal operations to replace certain patterns with other patterns. Using the `--optimize` and `--O1` flags on the command line and `.optimize()` and `.optimize({o1: true})` in the API will perform many of these operations along with additional optimizations that are not possible with traditional minification tools.

Additionally, if browsers are specified for the `--min` argument, minimum browser support will be enabled and recognized declarations and blocks that target older browser versions will be filtered out. For instance, `--min fx25,chr28` will remove any feature that explicitly targets versions of Firefox below 25 and versions of Chrome below 28.

For example, since most minification tools do not truly parse CSS, they cannot perform any reordering or transformation. Crass, on the other hand, will rewrite code like this:

```css
b, c, a {
	third: rgba(255, 255, 255, 0.9);
	second: abc;
	first: 50%;
}
```

into something that looks like:

```css
a, b, c {
	first: 50%;
	second: abc;
	third: hsla(0, 0%, 100%, 0.9);
}
```

Reordering selectors and declarations significantly improves minified code sizes. Colors can be translated between HSL/RGB/Hex to use the smallest form.

### Benchmarks

<table>
<tr><th>CSS Source<th>Original<th>Original gzip<th>YUI<th>YUI gzip<th>clean-css<th>clean-css gzip<th>crass<th>crass gzip
<tr><td>Firefox Marketplace<td>86983<td>19865<td>86911<td>19857<td>86983*<td>19865<td>82477<td>19395
<tr><td>Github Homepage<td>252797<td>47173<td>251779<td>46768<td>248190<td>46455<td>241408<td>45374
</table>

\* The Firefox Marketplace uses clean-css for minification.



## FAQ

### Will there be a version that runs in the browser?

Check out the Github pages for Crass for a simple browser-ready version.

http://mattbasta.github.io/crass

### What about comments? Docblocks?

All comments are ignored at the moment.

### What about following `@import` statements?

Crass does not follow import statements. Except when run from the command line, Crass has no concept of the file system. Consequently, mapping imports to other CSS files is a very difficult (or even impossible) task.

It is trivial, however, for an implementor to add import following on top of crass if the file system structure is known. After parsing, simply iterate the imports on the `Stylesheet` object, recursively parse and process each in turn, and inject their contents into the head of the `Stylesheet`. Building this is left as an exercise to the user.
