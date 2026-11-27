# no-shadowed-parameters

Disallow local variables that shadow a parameter of the same `@function` or `@mixin`.

<!-- prettier-ignore -->
```css
@function --f(--a) { --a: 2; result: var(--a); }
/*                    ↑
 *                    This hides the parameter */
```

A local variable (or `@private` property in a mixin) with the same name as a parameter overrides the argument that was passed, which makes the parameter useless.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a) { --a: 2; result: var(--a); }
```

<!-- prettier-ignore -->
```css
@mixin --m(--a) { @private { --a: 2; } color: var(--a); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f(--a) { --b: calc(var(--a) * 2); result: var(--b); }
```
