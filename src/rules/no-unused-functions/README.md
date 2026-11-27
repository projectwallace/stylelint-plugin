# no-unused-functions

Disallow `@function` rules that are never used.

<!-- prettier-ignore -->
```css
@function --f() { result: 1; }
/*      ↑
 *      This @function is never used */
```

A `@function` that is never called as `--name()` is dead code. Usages in the reference roots that stylelint provides (`referenceRoots`) count as well, so a stylesheet that only defines a function for other files can be linted together with those files.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@function --f() { result: 1; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f() { result: 1; } .a { width: --f(); }
```

### `ignore: Array<string | RegExp>`

Names to skip. Strings match exactly, regular expressions are tested against the name.

Given: `[true, { ignore: ['--f'] }]`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --f() { result: 1; }
```
