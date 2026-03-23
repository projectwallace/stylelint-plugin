# Max average selector complexity

Prevent the average selector complexity from exceeding a predefined maximum.

<!-- prettier-ignore -->
```css
a b c {} a {} b {}
/*  ↑
*   complexity of all selectors counts towards the average */
```

This rule calculates the **average complexity** of all selectors in the stylesheet. This is different from specificity since `:where(a b c d)` has specificity `[0, 0, 0]` but is pretty complex.

## Options

`Number`

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a b c d {} a {} b {}
```

<!-- prettier-ignore -->
```css
#a .b [c="d"] {} a {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a b {} a {}
```

<!-- prettier-ignore -->
```css
a {} b {} c {}
```
