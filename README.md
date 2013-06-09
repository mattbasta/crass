crass
=====

A Python CSS3 utility library


Optimizations
-------------

- Removal of unnecessary whitespace
- Lower-case identifiers appropriately
 - Element names
 - Pseudo selectors
 - Descriptor names
- Sort multiselectors
- Collapse mutliselectors containing wildcard selectors into just a wildcard selector
 - `.class, *` -> `*`
- Alphabetize descriptors (keeping relative order of identical descriptors)

### Deletions

- Remove mis-matched browser-prefixed declarations for browser-prefixed blocks
- Remove duplicate simple selectors within multiple selectors (`.class, .class` -> `.class`)
- Remove wildcard selector in simple selectors with other rules (`*.class` -> `.class`)
- Remove duplicate simple selector rules (`.class.class` -> `.class`)

### Combinations

- Combine identical media queries (`screen, screen` -> `screen`)
- Combine identical @keyframes blocks
- Combine keyframes with @keyframes blocks that have the same keyframe selector

Unimplemented Features
----------------------

### CSS Specification

Features that will be added:

- Paged media parsing support
- Conditional rules parsing support
- Device adaptation (`@viewport`) parsing support
- Standardized level 4 constructs

Features that might be added:

- Selectors 6.3.3: Attribute namespaces
- Selectors 6.6.1: Dynamic pseudo-classes
  - Selectors 6.6.1.1: `:visited`
  - Selectors 6.6.1.2: User action pseudo-classes
- Selectors 6.6.2: `:target`
- Selectors 6.6.3: `:lang`
- Selectors 6.6.4: UI element states
- Selectors 7.3: `::before` and `::after`

- Lists 8: `@counter-style`

Features that won't be added:

- Selectors 6.3.4: Attribute selectors and DTDs
- Selectors 7.1/7.2: `::first-line` and `::first-letter`
- Removed/special CSS features (`::selection`, `::contains()`)

\* Note that unimplemented selectors simply refer to the library's ability to match against those selectors in a document.


### Planned Optimizations

#### General

- Sort simple selector rules by specificity
- Lower-case identifiers appropriately
 - Units
 - Function names
 - Hex values
- Strip units from zero where appropriate (not in `hsl`/`hsla`)
- Combine lists of dimensions (except in coordinate declarations; e.g. `background-position` or `transform-origin`)
 - x x [x [x]] -> x
 - x y x y -> x y
 - x y z y -> x y z
 - x y x -> x y
- Convert `rgb()` to hex
- Convert `rgba()` to `hsla()` (and vise versa) if the opposite is smaller
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
- Sort adjacent groups of statements by specificity (most specific last)
- `:nth-child(2n+1)` -> `:nth-child(odd)`

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
- Combine near media blocks when possible
 - `@media X{a{}b{}c{}}@media Y{d{}e{}f{}}@media X{d{}e{}f{}}` -> `@media X{a{}b{}c{}d{}e{}f{}}@media Y{d{}e{}f{}}`

#### Deletions

- Remove "all" media type

#### Lossy/Unsafe (optional)

- Remove obsolete descriptors
 - Will result in dropped support for old browsers
 - Allow choice of browser support
- Combine statements with identical selectors across the whole sheet
 - May cause issues if CSS relies on order rather than specificity

#### Speculative Optimizations

- Spaces between @blocks and parentheses
 - `@media (` -> `@media(`
- Spaces between closing parentheses and next token
 - `url(...) foo` -> `url(...)foo`
 - Not IE7 compatible


Differences from CSS3
---------------------

- Unquoted URLs cannot contain parentheses.
- `@keyframes` blocks can be vendor prefixed (e.g.: `@-webkit-keyframes`).

