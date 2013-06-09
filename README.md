crass
=====

A Python CSS3 utility library


Unimplemented Features
----------------------

### CSS Specification

Features that will be added:

- Paged media parsing support
- Conditional rules parsing support

Features that might be added:

- Selectors 6.3.3: Attribute namespaces
- Selectors 6.6.1: Dynamic pseudo-classes
  - Selectors 6.6.1.1: `:visited`
  - Selectors 6.6.1.2: User action pseudo-classes
- Selectors 6.6.2: `:target`
- Selectors 6.6.3: `:lang`
- Selectors 6.6.4: UI element states
- Selectors 7.3: `::before` and `::after`

Features that won't be added:

- Selectors 6.3.4: Attribute selectors and DTDs
- Selectors 7.1/7.2: `::first-line` and `::first-letter`
- Removed/special CSS features (`::selection`, `::contains()`)

\* Note that unimplemented selectors simply refer to the library's ability to match against those selectors in a document.


### Planned Optimizations

#### General

- Alphabetize descriptors (keeping relative order of identical descriptors)
- Sort adjacent groups of rules by specificity (most specific last)
- Lower-case identifiers appropriately
 - Element names
 - Pseudo selectors
 - Descriptor names
 - Units
 - Function names
 - Hex values
- Strip units from zero where appropriate (not in `hsl`/`hsla`)
- Combine lists of dimensions (except in coordinate declarations; e.g. `background-position` or `transform-origin`)
 - x [x [x [x]]] -> x
 - x y x y -> x y
 - x y z y -> x y z
 - x y x -> x y
 - x x -> x
- Convert `rgb()` to hex
- #XXYYZZ -> #XYZ
- Convert hex to color names when available and smaller
- Convert color names to hex when smaller
- `font-weight: normal` -> `font-weight: 400` (also for `font`)
- `font-weight: bold` -> `font-weight: 700` (also for `font`)
- `none` -> `0` (when possible)
- Strip quotes from URLs when possible
- Attempt to switch quote types on URLs if smaller
- Strip quotes around font and animation names when possible
- Strip quotes around keyframe names when possible
- Strip quotes around attribute selectors when possible

#### Combinations

- Combine identical statements (into second)
- Combine near statements with identical selectors
- Combine adjacent descriptors into shorthand when possible
 - Cannot be done when descriptors are duplicated for compatibility
- Combine adjacent statements where one statement contains a subset of the other's declarations and the subset statement's total string length is greater than the length of the other statement's selector's string length
 - `x{a:b;c:d long}y{c:d long}` -> `x{a:b}x,y{c:d long}`
 - `x{c:d long}y{a:b;c:d long}` -> `x,y{c:d long}y{a;b}`
- Combine adjacent statements containing an intersection of declarations where the intersection's string length is greater than the length of the two statements' selectors' string length plus one
 - `x {a:b;c:d long value} y{e:f;c:d long value}` -> `x{a:b}y{e:f}x,y{c:d long value}`
- Combine identical or overridden media query expressions
- Combine identical media queries (`screen, screen` -> `screen`)
- Combine near media blocks when possible
 - `@media X{a{}b{}c{}}@media Y{d{}e{}f{}}@media X{d{}e{}f{}}` -> `@media X{a{}b{}c{}d{}e{}f{}}@media Y{d{}e{}f{}}`

#### Deletions

- Remove overridden descriptors
- Remove wildcard selector in simple selectors with other rules (`*.class` -> `.class`)
- Remove duplicate simple selector rules (`.class.class` -> `.class`)
- Remove duplicate simple selectors within multiple selectors (`.class, .class` -> `.class`)
- Remove "all" media type
- Remove mis-matched browser-prefixed declarations for browser-prefixed blocks

#### Lossy/Unsafe (optional)

- Remove obsolete descriptors
 - Will result in dropped support for old browsers
 - Allow choice of browser support
- Combine identical statements within the whole sheet
 - May cause issues if CSS relies on order rather than specificity


Differences from CSS3
---------------------

- Unquoted URLs cannot contain parentheses.
- `@keyframes` blocks can be vendor prefixed (e.g.: `@-webkit-keyframes`).

