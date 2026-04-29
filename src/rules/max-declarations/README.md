# Max declarations

Limit the total number of declarations in a stylesheet.

<!-- prettier-ignore -->
```css
a { color: red; background: blue; }
/*  ↑
*   each declaration counts towards the total */
```

This rule counts every property declaration across the entire stylesheet. Limiting the total number of declarations encourages reuse and helps keep stylesheets concise.

Where per-rule limits catch individual complexity, this catches cumulative scale: a stylesheet can pass every granular check and still have grown too large to reason about as a whole.

## Options

`Number`

Given:

`1`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; background: blue; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
```
