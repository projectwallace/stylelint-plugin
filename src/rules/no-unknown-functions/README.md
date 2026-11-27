# no-unknown-functions

Disallow calling custom functions that are not defined.

<!-- prettier-ignore -->
```css
.a { width: --double(2px); }
/*             ↑
 *             This function is not defined */
```

Calling a `--name()` function that has no `@function` rule makes the declaration invalid at computed-value time. Definitions in the reference roots that stylelint provides (`referenceRoots`) count as well. Use `ignore` for functions that are defined in files that are not linted together.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
.a { width: --double(2px); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@function --double(--x) { result: calc(var(--x) * 2); }
.a { width: --double(2px); }
```

### `ignore: Array<string | RegExp>`

Names to skip. Strings match exactly, regular expressions are tested against the name.

Given: `[true, { ignore: ['--from-elsewhere'] }]`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.a { width: --from-elsewhere(); }
```
