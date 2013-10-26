# crass

A CSS3 utility library for Python and JS.

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

### JS

If you `npm install -g crass`, you'll get `crass` on your PATH.

```bash
crass input.css [--optimize [--O1]] [--pretty]
```

### Python

If you `pip install crass`, you'll get `crass` on your PATH.

```bash
crass input.css [--optimize [--O1] [--O2] [--no-reorder]] [--pretty]
```

## Minification

Outputting a crass object as a string will perform the equivalent of most CSS minification tools. The corresponding styles are output in the minimum amount of CSS possible, without any whitespace.

Some minifiers also perform basic replacement and removal operations to replace certain patterns with other patterns. Using the `--optimize` and `--O1` flags on the command line and `.optimize()` and `.optimize({o1: true})` in the API will perform many of these operations along with additional optimizations that are not possible with traditional minification tools.

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
<tr><th>CSS Source<th>Original Size<th>YUI<th>YUI gzipped<th>clean-css<th>clean-css gzipped<th>crass<th>crass gzipped
<tr><td>Firefox Marketplace<td>84446<td>84404<td>19690<td>84446*<td>19691<td>81308<td>19341
<tr><td>Github Homepage<td>269633<td>268563<td>49811<td>267418<td>49781<td>259740<td>48332
</table>

\* The Firefox Marketplace uses clean-css for minification.



## FAQ

### Will there be a version that runs in the browser?

Yes, it's in progress.

### The encoding is weird.

I'm working on it.

### What about comments? Docblocks?

They're stripped at the moment, but I'm planning to add a mode to preserve them.

### What about following `@import` statements?

I'm not sure what I want to do with this yet, since `@imports` are not necessarily relative to the open file. For now, crass doesn't have any remote file logic.

### Feature X is implemented for platform Y but not platform Z / Bug X exists in platform Y

Please file an issue, I'll get around to it eventually.
