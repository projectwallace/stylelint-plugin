# Max average selectors per rule

Prevent the average number of selectors per rule from exceeding a predefined maximum.

<!-- prettier-ignore -->
```css
a, b, c { color: red; }
/* ↑
*  all selectors across all rules count towards the average */
```

This rule calculates the **average number of selectors** per style rule across the entire stylesheet.

## Options

`Number`

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a, b, c { color: red; }
d { color: blue; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a, b { color: red; }
c { color: blue; }
```

<!-- prettier-ignore -->
```css
a { color: red; }
```
