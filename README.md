# crass

A CSS3 minification, pretty printing, and general utility library for JS.

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

// The constructors for the AST nodes used to represent the
// parsed CSS are available on `crass.objects`.

```

Improvements on the API will be made in the future.

## Command Line Interface

If you `npm install -g crass`, you'll get `crass` on your PATH.

```bash
crass input.css [--optimize [--O1]] [--min x,y,z] [--pretty] [--saveie]
```

- **`--optimize`**: Flag to enable basic optimization
- **`--O1`**: Only applies when `--optimize` is active. Flag to enable more advanced optimizations, though these are not guaranteed to work for all CSS.
- **`--min`**: Setting this flag followed by a comma-separated list of browser versions will instruct Crass to strip CSS that would otherwise only apply to browsers older than the versions listed. For example, `--min ie9,fx30` would strip CSS that applies only to Firefox 29 and below and Internet Explorer 8 and below. The following prefixes are supported: `ie`, `op`, `fx`, `chr`
- **`--pretty`**: Flag to enable pretty printing of output
- **`--saveie`**: Flag to enable features to specifically support Internet Explorer 6 and below


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

Reordering selectors and declarations significantly improves minified code sizes. Colors can be translated between HSL/RGB/hex/etc. to use the smallest form.

### Benchmarks

Crass performs very well in many CSS minification benchmarks. See [goalsmashers' css minification benchmark](http://goalsmashers.github.io/css-minification-benchmark/) for more.


## FAQ

### Will there be a version that runs in the browser?

You can import Crass into your project using any appropriate build tool, like browserify or Webpack. Crass's importable modules have no dependencies on anything browser-incompatible.

Check out the Github pages for Crass for a simple browser-ready version:

http://mattbasta.github.io/crass

### What about comments? Docblocks?

All comments are ignored at the moment. Support for storing comment data may be added in the future, and contributions to add this support are welcome.

### What about `@import` statements?

Crass does not follow `@import` statements. Except when run from the command line, Crass has no concept of the file system. Consequently, mapping imports to other CSS files is a very difficult (or even impossible) task.

It is trivial, however, for an implementor to add import following on top of crass if the file system structure is known. After parsing, simply iterate the imports on the `Stylesheet` object, recursively parse and process each in turn, and inject their contents into the head of the `Stylesheet`. Building this is left as an exercise to the user.
