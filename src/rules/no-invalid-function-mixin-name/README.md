# no-invalid-function-mixin-name

Disallow `@function`, `@mixin` and `@apply` names that do not start with `--`.

<!-- prettier-ignore -->
```css
@function double(--x) { result: calc(var(--x) * 2); }
/*        ↑
 *        This name does not start with -- */
```

Custom function and mixin names must be dashed identifiers (`--name`). A definition without the dashes is invalid and silently ignored by the browser, and so is an `@apply` that refers to such a name.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function double(--x) { result: calc(var(--x) * 2); }
```

<!-- prettier-ignore -->
```css
@mixin center { display: grid; }
```

<!-- prettier-ignore -->
```css
.a { @apply center; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --double(--x) { result: calc(var(--x) * 2); }
```

<!-- prettier-ignore -->
```css
@mixin --center { display: grid; }
```

<!-- prettier-ignore -->
```css
.a { @apply --center; }
```
