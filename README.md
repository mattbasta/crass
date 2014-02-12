# crass

A CSS3 utility library for Python.

## Command Line Interface

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

