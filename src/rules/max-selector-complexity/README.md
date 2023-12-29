# Max selector complexity

Prevent selector complexity from going over a predefined maximum.

<!-- prettier-ignore -->
```css
a b c d e f g h {}
/*  ↑
*   complexity gets a bit much after this */
```

This rule calculates the **complexity** of all selectors. This is different from specificity since `:where(a b c d e f g h)` has specificity `[0, 0, 0]` but is pretty complex.

## Options

`Number`

Given:

`3`

the following are considered violations:

<!-- prettier-ignore -->
```css
a b c d {}
```

<!-- prettier-ignore -->
```css
#a .b [c="d"] {}
```

<!-- prettier-ignore -->
```css
:-moz-any(a > b, c + d) {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a b {}
```

<!-- prettier-ignore -->
```css
#a > .b {}
```

<!-- prettier-ignore -->
```css
:-moz-any(a) {}
```
