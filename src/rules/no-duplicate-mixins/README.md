# no-duplicate-mixins

Disallow duplicate `@mixin` names.

<!-- prettier-ignore -->
```css
@mixin --m() { color: red; }
@mixin --m() { color: red; }
/*      ↑
 *      This duplicate name */
```

Defining the same `@mixin` name twice in one cascade layer is almost always a mistake: the later definition silently wins and the earlier one is dead code. Definitions in different layers are not reported because layers are the intended way to override a mixin.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@mixin --m() { color: red; }
@mixin --m() { color: red; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@mixin --m() { color: red; }
@mixin --m-2() { color: red; }
```

<!-- prettier-ignore -->
```css
@layer base { @mixin --m() { color: red; } }
@layer theme { @mixin --m() { color: red; } }
```
