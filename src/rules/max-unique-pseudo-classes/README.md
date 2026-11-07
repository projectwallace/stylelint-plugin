# Max unique pseudo-classes

Limit the number of unique pseudo-classes used across the stylesheet.

<!-- prettier-ignore -->
```css
a:hover { color: red; }
/*  ↑
*   counts as one of the unique pseudo-classes */
```

A unique pseudo-class is counted by its name, so `:nth-child(2)` and `:nth-child(odd)` both count as `:nth-child`. Pseudo-classes inside functional pseudo-classes such as `:is()`, `:not()` and `:has()` are counted too. Pseudo-elements (`::before`) are not counted, including their legacy single-colon notation (`:before`). Names are compared case-insensitively.

Relying on a very wide set of pseudo-classes increases the number of states that have to be designed, tested and supported. This rule helps keep that set small.

## Options

### `Number` (required)

The maximum number of unique pseudo-classes allowed. Must be a non-negative integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a:hover { color: red; }
a:focus { color: red; }
a:active { color: red; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a:hover { color: red; }
a:focus { color: red; }
a:hover { color: red; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

Strings wrapped in `/` delimiters (e.g. `"/^foo/"`, `"/^foo/i"`) are treated as regular expressions. This allows regex patterns in JSON config files without needing a `.mjs` config.

A list of values to exclude from the count. Each entry can be an exact string or a regular expression, and is matched against the same value that is counted by this rule.

Given:

`[1, { "ignore": [":hover"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a:hover { color: red; }
a:focus { color: red; }
```
