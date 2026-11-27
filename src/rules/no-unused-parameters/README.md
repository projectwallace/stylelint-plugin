# no-unused-parameters

Disallow `@function` and `@mixin` parameters that are never used.

<!-- prettier-ignore -->
```css
@function --f(--a, --b) { result: var(--a); }
/*                ↑
 *                This parameter is never read */
```

A parameter that is never read with `var()` in the body of its `@function` or `@mixin` is dead weight in the signature and misleads callers. Usages in nested rules, `if()`, `calc()` and `@apply` arguments are taken into account.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a, --b) { result: var(--a); }
```

<!-- prettier-ignore -->
```css
@mixin --m(--color) { display: grid; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a) { result: var(--a); }
```

<!-- prettier-ignore -->
```css
@mixin --m(--color) { color: var(--color); }
```

<!-- prettier-ignore -->
```css
@mixin --m(--gap) { & > * { gap: var(--gap, 0); } }
```

### `ignore: Array<string | RegExp>`

Names to skip. Strings match exactly, regular expressions are tested against the name.

Given: `[true, { ignore: ['--_unused'] }]`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f(--_unused) { result: 1; }
```
