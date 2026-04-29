# Max at-rules

Limit the total number of at-rules in a stylesheet.

<!-- prettier-ignore -->
```css
@media screen { a { color: red; } }
@media print  { a { color: blue; } }
/* ↑
*  each at-rule counts towards the total */
```

This rule counts every at-rule (`@media`, `@keyframes`, `@supports`, etc.) in the stylesheet. Keeping the number of at-rules low reduces complexity and makes stylesheets easier to manage.

Where per-rule limits catch individual complexity, this catches cumulative scale: a stylesheet can pass every granular check and still have grown too large to reason about as a whole.

## Options

`Number`

Given:

`1`

the following are considered violations:

<!-- prettier-ignore -->
```css
@media screen { a { color: red; } }
@media print  { a { color: blue; } }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@media screen { a { color: red; } }
```
