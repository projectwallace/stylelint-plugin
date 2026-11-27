# no-duplicate-parameters

Disallow duplicate parameter names in `@function` and `@mixin`.

<!-- prettier-ignore -->
```css
@function --f(--a, --a) { result: var(--a); }
/*                ↑
 *                This duplicate parameter */
```

Declaring the same parameter name twice makes the whole `@function` or `@mixin` rule invalid, so it is ignored by the browser.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a, --a) { result: var(--a); }
```

<!-- prettier-ignore -->
```css
@mixin --m(--a, --b, --a) {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a, --b) { result: var(--a); }
```
