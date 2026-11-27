# max-parameters

Limit the number of parameters of `@function` and `@mixin`.

<!-- prettier-ignore -->
```css
@function --f(--a, --b, --c, --d) { result: 1; }
/*         ↑
 *         This function has too many parameters */
```

Functions and mixins with many parameters are hard to call and to read. Consider grouping related parameters or splitting the function.

## Options

`number`

The maximum number of parameters, a positive integer. Given: `3`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a, --b, --c, --d) { result: 1; }
```

<!-- prettier-ignore -->
```css
@mixin --m(--a, --b, --c, --d) {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a, --b, --c) { result: 1; }
```
