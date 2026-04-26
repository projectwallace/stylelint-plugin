# Max unique z-indexes

Limit the number of unique `z-index` values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { z-index: 100; }
/*           ↑
*   100 counts as a unique z-index */
```

Z-index proliferation is one of the most common sources of layout bugs and maintenance headaches. When dozens of unique z-index values exist in a codebase, developers start reaching for arbitrary large numbers (`z-index: 9999`) to "win" the stacking game. This rule encourages defining a z-index scale and sticking to it.

Only numeric values are counted. Keywords like `auto`, `inherit`, `initial`, and `unset`, as well as `var()` references, are not counted.

> **Note**: Values are compared by their exact string representation. `1` and `01` are treated as two distinct values.

## Options

### `Number` (required)

The maximum number of unique z-index values allowed. Must be a non-negative integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { z-index: 1; }
b { z-index: 2; }
c { z-index: 3; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { z-index: 10; }
b { z-index: 10; }
c { z-index: 20; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of z-index values to exclude from the count. Each entry can be an exact string or a regular expression.

Given:

`[2, { "ignore": ["9999"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a { z-index: 1; }
b { z-index: 2; }
c { z-index: 9999; }
```
