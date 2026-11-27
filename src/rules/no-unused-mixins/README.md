# no-unused-mixins

Disallow `@mixin` rules that are never used.

<!-- prettier-ignore -->
```css
@mixin --m() { color: red; }
/*      ↑
 *      This @mixin is never used */
```

A `@mixin` that is never applied with `@apply` is dead code. Usages in the reference roots that stylelint provides (`referenceRoots`) count as well, so a stylesheet that only defines a mixin for other files can be linted together with those files.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@mixin --m() { color: red; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@mixin --m() { color: red; } .a { @apply --m; }
```

### `ignore: Array<string | RegExp>`

Names to skip. Strings match exactly, regular expressions are tested against the name.

Given: `[true, { ignore: ['--m'] }]`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@mixin --m() { color: red; }
```
