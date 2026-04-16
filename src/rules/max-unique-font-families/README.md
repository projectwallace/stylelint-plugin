# Max unique font families

Limit the number of unique font family values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { font-family: Arial, sans-serif; }
/*               ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
*   The entire value counts as one unique font family */
```

Using too many different font family values can indicate an inconsistent design system. This rule helps enforce a controlled typographic palette.

A unique font family is the entire value string of a `font-family` declaration or the font-family portion extracted from a `font` shorthand. The same string used in multiple places counts only once.

The rule inspects both the `font-family` property and the `font` shorthand property.

## Options

### `Number` (required)

The maximum number of unique font family values allowed. Must be a non-negative integer. Setting `0` enforces that no font families are used at all.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { font-family: Arial, sans-serif; }
b { font-family: Georgia, serif; }
c { font-family: monospace; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { font-family: Arial, sans-serif; }
b { font: bold 16px Arial, sans-serif; }
/* Both declarations share the same font-family value → only 1 unique entry */
```

### `allowList` (optional)

Type: `Array<string | RegExp>`

A list of font family values to exclude from the count. Each entry can be an exact string or a regular expression matched against the full value string.

Given:

`[2, { "allowList": ["Arial, sans-serif"] }]`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { font-family: Arial, sans-serif; }  /* ignored */
b { font-family: Georgia, serif; }
c { font-family: monospace; }
```
