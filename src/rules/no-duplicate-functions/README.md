# no-duplicate-functions

Disallow duplicate `@function` names.

<!-- prettier-ignore -->
```css
@function --f() { result: 1; }
@function --f() { result: 1; }
/*      ↑
 *      This duplicate name */
```

Defining the same `@function` name twice in one cascade layer is almost always a mistake: the later definition silently wins and the earlier one is dead code. Definitions in different layers are not reported because layers are the intended way to override a function.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f() { result: 1; }
@function --f() { result: 1; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f() { result: 1; }
@function --f-2() { result: 1; }
```

<!-- prettier-ignore -->
```css
@layer base { @function --f() { result: 1; } }
@layer theme { @function --f() { result: 1; } }
```
