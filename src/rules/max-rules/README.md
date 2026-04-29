# Max rules

Limit the total number of rules in a stylesheet.

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
/* ↑
*  each rule counts towards the total */
```

This rule counts every style rule block in the stylesheet. Limiting the total number of rules encourages reuse and helps keep stylesheets small and maintainable.

Where per-rule limits catch individual complexity, this catches cumulative scale: a stylesheet can pass every granular check and still have grown too large to reason about as a whole.

## Options

`Number`

Given:

`1`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
```
