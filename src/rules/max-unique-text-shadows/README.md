# Max unique text shadows

Limit the number of unique `text-shadow` values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); }
/*              ↑
*   "1px 1px 2px rgba(0, 0, 0, 0.5)" counts as a unique text shadow */
```

Using too many different text-shadow values can indicate an inconsistent design system. This rule helps enforce a controlled set of shadow values.

A unique text shadow is counted by its exact string representation. Multi-layer shadows (comma-separated) count as a single unique value.

The following CSS property is checked:

- `text-shadow`

> **Note**: Shadows are compared by their exact string value. `1px 1px red` and `2px 2px red` are treated as two distinct shadows.

## Options

### `Number` (required)

The maximum number of unique `text-shadow` values allowed. Must be a positive integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { text-shadow: 1px 1px red; }
b { text-shadow: 2px 2px blue; }
c { text-shadow: 3px 3px green; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { text-shadow: 1px 1px red; }
b { text-shadow: 1px 1px red; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of text-shadow values to exclude from the count. Each entry can be an exact string or a regular expression.

> **Note**: String patterns are matched against the exact string value of the detected shadow.

Given:

`[1, { "ignore": ["1px 1px red"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a { text-shadow: 1px 1px red; }
b { text-shadow: 2px 2px blue; }
```
