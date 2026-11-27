# no-invalid-function-body

Disallow properties other than `result` and custom properties in `@function`.

<!-- prettier-ignore -->
```css
@function --f() { retrun: 1; }
/*                 ↑
 *                 This is ignored */
```

The body of a `@function` only accepts the `result` descriptor and custom properties (local variables). Anything else is ignored by the browser, which usually points to a typo such as `retrun`.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f() { retrun: 1; }
```

<!-- prettier-ignore -->
```css
@function --f() { color: red; result: 1; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f() { --a: 1; result: var(--a); }
```
