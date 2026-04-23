# Max unique box shadows

Limit the number of unique `box-shadow` values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); }
/*              ↑
*   "0 2px 4px rgba(0, 0, 0, 0.5)" counts as a unique box shadow */
```

Using too many different box-shadow values can indicate an inconsistent design system. This rule helps enforce a controlled set of shadow values.

A unique box shadow is counted by its exact string representation. Multi-layer shadows (comma-separated) count as a single unique value.

The following CSS property is checked:

- `box-shadow`

> **Note**: Shadows are compared by their exact string value. `0 2px 4px red` and `0 4px 8px red` are treated as two distinct shadows.

## Options

### `Number` (required)

The maximum number of unique `box-shadow` values allowed. Must be a positive integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { box-shadow: 0 2px 4px red; }
b { box-shadow: 0 4px 8px blue; }
c { box-shadow: 0 8px 16px green; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { box-shadow: 0 2px 4px red; }
b { box-shadow: 0 2px 4px red; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of box-shadow values to exclude from the count. Each entry can be an exact string or a regular expression.

> **Note**: String patterns are matched against the exact string value of the detected shadow.

Given:

`[1, { "ignore": ["0 2px 4px red"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a { box-shadow: 0 2px 4px red; }
b { box-shadow: 0 4px 8px blue; }
```
