# no-empty-mixins

Disallow empty `@mixin` rules.

<!-- prettier-ignore -->
```css
@mixin --noop() {}
/*      ↑
 *      This mixin does nothing */
```

A `@mixin` without declarations, rules or `@contents` does nothing when it is applied.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@mixin --noop() {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@mixin --center() { display: grid; }
```

<!-- prettier-ignore -->
```css
@mixin --on-mobile() { @media (width < 40em) { @contents; } }
```
