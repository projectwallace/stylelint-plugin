# no-apply-too-many-arguments

Disallow passing more arguments to `@apply` than the mixin has parameters.

<!-- prettier-ignore -->
```css
@mixin --m(--a) { color: var(--a); }
.a { @apply --m(red, blue); }
/*         ↑
 *         This passes 2 arguments to 1 parameter */
```

When `@apply` passes more arguments than the `@mixin` declares parameters, the whole `@apply` does nothing. Mixins that are not defined in the stylesheet or the reference roots are skipped.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@mixin --m(--a) { color: var(--a); }
.a { @apply --m(red, blue); }
```

<!-- prettier-ignore -->
```css
@mixin --n { color: red; }
.a { @apply --n(red); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@mixin --m(--a, --b) { color: var(--a); }
.a { @apply --m(red); }
```
