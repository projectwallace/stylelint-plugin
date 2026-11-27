# no-recursive-functions

Disallow `@function` rules that call themselves.

<!-- prettier-ignore -->
```css
@function --f(--x) { result: --f(10); }
/*                        ↑
 *                        This calls itself */
```

A function that calls itself in its `result` or in a local variable is in a cycle, so it always returns the guaranteed-invalid value. Calls inside conditional rules such as `@media` are not reported because they might never be evaluated.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f(--x) { result: --f(10); }
```

<!-- prettier-ignore -->
```css
@function --f() { --x: --f(); result: 1; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f(--x) { result: --g(var(--x)); }
```

<!-- prettier-ignore -->
```css
@function --f(--x) { @media (unknown-feature) { result: --f(1); } result: 1; }
```
