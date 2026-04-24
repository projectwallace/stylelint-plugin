# Max unique line heights

Limit the number of unique line height values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { line-height: 1.5; }
/*               ↑↑↑
*   This value counts as one unique line height */
```

Using too many different line height values can indicate an inconsistent design system. This rule helps enforce a controlled typographic scale.

A unique line height is the entire value string of a `line-height` declaration or the line-height portion extracted from a `font` shorthand. The same string used in multiple places counts only once.

The rule inspects both the `line-height` property and the `font` shorthand property.

## Options

### `Number` (required)

The maximum number of unique line height values allowed. Must be a non-negative integer. Setting `0` enforces that no line heights are used at all.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { line-height: 1; }
b { line-height: 1.5; }
c { line-height: 2; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { line-height: 1.5; }
b { font: bold 16px/1.5 Arial, sans-serif; }
/* Both declarations share the same line-height value → only 1 unique entry */
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of line height values to exclude from the count. Each entry can be an exact string or a regular expression matched against the full value string.

Given:

`[2, { "ignore": ["1.5"] }]`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { line-height: 1.5; }  /* ignored */
b { line-height: 2; }
c { line-height: 3; }
```
