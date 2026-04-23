# Max unique animation functions

Limit the number of unique animation timing functions used across the stylesheet.

<!-- prettier-ignore -->
```css
a { animation-timing-function: ease; }
/*                              ↑
*   "ease" counts as a unique animation timing function */
```

Using too many different timing functions can indicate an inconsistent design system. This rule helps enforce a controlled set of easing values.

Each individual timing function value is counted separately. Comma-separated lists (e.g. `animation-timing-function: ease, linear`) are split into individual values.

The following CSS properties are checked:

- `animation-timing-function`
- `transition-timing-function`
- `animation` (shorthand)
- `transition` (shorthand)

> **Note**: Timing functions are compared by their exact string value. `ease` and `cubic-bezier(0.25, 0.1, 0.25, 1)` are treated as two distinct values.

## Options

### `Number` (required)

The maximum number of unique animation timing functions allowed. Must be a positive integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { animation-timing-function: ease; }
b { animation-timing-function: linear; }
c { animation-timing-function: ease-in; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { animation-timing-function: ease; }
b { transition-timing-function: ease; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of timing function values to exclude from the count. Each entry can be an exact string or a regular expression.

> **Note**: String patterns are matched against the exact string value of the detected timing function.

Given:

`[1, { "ignore": ["ease"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a { animation-timing-function: ease; }
b { animation-timing-function: linear; }
```
