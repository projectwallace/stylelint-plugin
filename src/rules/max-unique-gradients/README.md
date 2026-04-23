# Max unique gradients

Limit the number of unique gradient values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { background-image: linear-gradient(red, blue); }
/*                    ↑
*   "linear-gradient(red, blue)" counts as a unique gradient */
```

Using too many different gradients can indicate an inconsistent design system. This rule helps enforce a controlled set of gradient values.

A unique gradient is counted by its exact string representation. The following gradient functions are detected:

- `linear-gradient()`
- `radial-gradient()`
- `conic-gradient()`
- `repeating-linear-gradient()`
- `repeating-radial-gradient()`
- `repeating-conic-gradient()`

The following CSS properties are checked:

- `background`
- `background-image`

> **Note**: Gradients are compared by their exact string value. `linear-gradient(red, blue)` and `linear-gradient(blue, red)` are treated as two distinct gradients.

## Options

### `Number` (required)

The maximum number of unique gradient values allowed. Must be a positive integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { background-image: linear-gradient(red, blue); }
b { background-image: conic-gradient(red, blue); }
c { background-image: repeating-linear-gradient(red, blue); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { background-image: linear-gradient(red, blue); }
b { background-image: linear-gradient(red, blue); }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of gradient values to exclude from the count. Each entry can be an exact string or a regular expression.

> **Note**: String patterns are matched against the exact string value of the detected gradient.

Given:

`[1, { "ignore": ["linear-gradient(red, blue)"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a { background-image: linear-gradient(red, blue); }
b { background-image: conic-gradient(red, blue); }
```
