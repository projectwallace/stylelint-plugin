# no-misplaced-mixin-rules

Disallow `@mixin`, `@contents` and `@apply` in places where they are invalid.

<!-- prettier-ignore -->
```css
.a { @mixin --m() {} }
/*  ↑
 *  A @mixin cannot be nested */
```

`@mixin` is only valid at the top level (it cannot be nested in a style rule), `@contents` is only valid in the body of a `@mixin` and `@apply` is only valid inside a style rule or `@mixin`. Browsers ignore them anywhere else.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
.a { @mixin --m() {} }
```

<!-- prettier-ignore -->
```css
@contents;
```

<!-- prettier-ignore -->
```css
@apply --m;
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@mixin --m() { @contents; }
```

<!-- prettier-ignore -->
```css
.a { @apply --m; }
```

<!-- prettier-ignore -->
```css
@mixin --n() { @apply --m; }
```
