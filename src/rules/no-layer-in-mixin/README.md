# no-layer-in-mixin

Disallow `@layer` inside `@mixin`.

<!-- prettier-ignore -->
```css
@mixin --m() { @layer base { color: red; } }
/*            ↑
 *            This @layer is dropped */
```

`@layer` is not valid inside a mixin body: its contents are dropped when the mixin is applied.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@mixin --m() { @layer base { color: red; } }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@layer base { @mixin --m() { color: red; } }
```
