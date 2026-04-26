# Max selector specificity

Prevent individual selector specificity from exceeding a predefined maximum.

<!-- prettier-ignore -->
```css
#foo .bar .baz span {}
/*  ↑
*   this selector's specificity is [1, 2, 1] */
```

This rule checks the **specificity of each individual selector** and reports a violation when any single selector exceeds the configured maximum. This complements `max-average-specificity`, which only tracks the stylesheet-wide average and can miss outlier selectors that force a specificity arms race.

## Options

`[number, number, number]`

An array of three non-negative integers representing the maximum allowed specificity as `[a, b, c]` where:

- `a` — ID selectors
- `b` — class, attribute, and pseudo-class selectors
- `c` — type and pseudo-element selectors

Given:

`[0, 4, 0]`

the following are considered violations:

<!-- prettier-ignore -->
```css
#foo .a .b .c span {}
```

<!-- prettier-ignore -->
```css
a, #bar {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.a .b {}
```

<!-- prettier-ignore -->
```css
a, .foo, .bar {}
```
