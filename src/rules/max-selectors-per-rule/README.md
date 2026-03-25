# Max selectors per rule

Limit the number of selectors in a single rule.

<!-- prettier-ignore -->
```css
a, b, c, d, e, f, g, h, i, j, k { color: red; }
/* ↑
*  these 11 selectors on a single rule may be flagged */
```

## Options

`Number`

Given:

`10`

the following are considered violations:

<!-- prettier-ignore -->
```css
a, b, c, d, e, f, g, h, i, j, k { color: red; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a, b, c { color: red; }
```

<!-- prettier-ignore -->
```css
a { color: red; }
```
