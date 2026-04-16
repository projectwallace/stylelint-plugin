# Max unique font families

Limit the number of unique font families used across the stylesheet.

<!-- prettier-ignore -->
```css
a { font-family: Arial, sans-serif; }
/*               ↑     ↑
*   Two unique font families are counted here */
```

Using too many different font families can indicate an inconsistent design system. This rule helps enforce a controlled typographic palette.

Each entry in a comma-separated `font-family` list counts as one unique font family. Families are compared by their exact string value — quoted and unquoted variants of the same name (e.g. `"Times New Roman"` vs. `Times New Roman`) are treated as distinct.

The rule inspects both the `font-family` property and the `font` shorthand property.

## Options

### `Number` (required)

The maximum number of unique font families allowed. Must be a positive integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { font-family: Arial, Helvetica, sans-serif; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { font-family: Arial, sans-serif; }
b { font: bold 16px Arial; }
```
