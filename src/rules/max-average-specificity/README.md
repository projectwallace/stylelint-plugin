# Max average specificity

Prevent the average specificity from exceeding a predefined maximum.

<!-- prettier-ignore -->
```css
a {} .b {} #c {}
/*  ↑
*   specificity of all selectors counts towards the average */
```

This rule calculates the **average specificity** of all selectors in the stylesheet and reports a violation when that average exceeds the configured maximum.

## Options

`[number, number, number]`

An array of three non-negative numbers (floats allowed), representing the maximum allowed average specificity as `[a, b, c]` where:

- `a` — ID selectors
- `b` — class, attribute, and pseudo-class selectors
- `c` — type and pseudo-element selectors

Given:

`[0, 2.5, 1]`

the following are considered violations:

<!-- prettier-ignore -->
```css
#a { color: red; } #b { color: blue; } #c { color: green; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; } b { color: blue; }
```

<!-- prettier-ignore -->
```css
.foo { color: red; } .bar { color: blue; } a { color: green; }
```
