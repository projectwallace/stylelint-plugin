# require-function-result

Require a `result` descriptor in every `@function`.

<!-- prettier-ignore -->
```css
@function --f(--a) { --b: 1px; }
/*         ↑
 *         This function has no result */
```

A `@function` without a `result` descriptor is valid, but it always returns the guaranteed-invalid value, so every declaration that calls it is invalid at computed-value time. This is nearly always a forgotten `result`.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a) { --b: 1px; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a) { result: var(--a); }
```

<!-- prettier-ignore -->
```css
@function --f(--a) { @media (width > 40em) { result: 1px; } result: 2px; }
```
