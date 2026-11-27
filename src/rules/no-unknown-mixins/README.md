# no-unknown-mixins

Disallow applying mixins that are not defined.

<!-- prettier-ignore -->
```css
.a { @apply --center; }
/*         ↑
 *         This mixin is not defined */
```

An `@apply` of a mixin without an `@mixin` rule does nothing. Definitions in the reference roots that stylelint provides (`referenceRoots`) count as well. Use `ignore` for mixins that are defined in files that are not linted together.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
.a { @apply --center; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@mixin --center { display: grid; }
.a { @apply --center; }
```

### `ignore: Array<string | RegExp>`

Names to skip. Strings match exactly, regular expressions are tested against the name.

Given: `[true, { ignore: ['--from-elsewhere'] }]`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.a { @apply --from-elsewhere; }
```
