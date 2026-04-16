# Max unique font sizes

Limit the number of unique font size values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { font-size: 16px; }
/*             ↑↑↑↑
*   This value counts as one unique font size */
```

Using too many different font size values can indicate an inconsistent design system. This rule helps enforce a controlled typographic scale.

A unique font size is the entire value string of a `font-size` declaration or the font-size portion extracted from a `font` shorthand. The same string used in multiple places counts only once.

The rule inspects both the `font-size` property and the `font` shorthand property.

## Options

### `Number` (required)

The maximum number of unique font size values allowed. Must be a non-negative integer. Setting `0` enforces that no font sizes are used at all.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { font-size: 12px; }
b { font-size: 16px; }
c { font-size: 24px; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { font-size: 16px; }
b { font: bold 16px Arial, sans-serif; }
/* Both declarations share the same font-size value → only 1 unique entry */
```

### `allowList` (optional)

Type: `Array<string | RegExp>`

A list of font size values to exclude from the count. Each entry can be an exact string or a regular expression matched against the full value string.

Given:

`[2, { "allowList": ["16px"] }]`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { font-size: 16px; }  /* ignored */
b { font-size: 24px; }
c { font-size: 32px; }
```
