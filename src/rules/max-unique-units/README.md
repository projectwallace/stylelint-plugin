# Max unique units

Limit the number of unique CSS units used across the stylesheet.

<!-- prettier-ignore -->
```css
a { width: 10px; }
/*          ↑
*   px counts as a unique unit */
```

Using too many different units (e.g. `px`, `rem`, `em`, `vh`, `vw`, `%`, etc.) can indicate an inconsistent design system. This rule helps enforce a consistent set of units.

## Options

`Number`

The option must be a positive integer.

Given:

`3`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { width: 10px; height: 5em; margin: 1rem; padding: 2vh; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { width: 10px; height: 5px; margin: 1rem; }
```
