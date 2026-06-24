# No prefixed atrules

Disallow vendor-prefixed at-rules.

<!-- prettier-ignore -->
```css
@-webkit-keyframes fade { from {} to {} }
/* ↑
*  This vendor-prefixed at-rule is not allowed */
```

Vendor-prefixed at-rules like `@-webkit-keyframes` and `@-ms-viewport` are outdated and should use their standard unprefixed equivalents.

## Options

`true`

The following are considered violations:

<!-- prettier-ignore -->
```css
@-webkit-keyframes fade {
	from { opacity: 0 }
	to { opacity: 1 }
}
```

<!-- prettier-ignore -->
```css
@-ms-viewport {
	width: device-width;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@keyframes fade {
	from { opacity: 0 }
	to { opacity: 1 }
}
```

### `ignore: Array<string | RegExp>`

Ignore specific vendor-prefixed at-rule names by exact string or regular expression.

Strings wrapped in `/` delimiters (e.g. `"/^-webkit-/"`, `"/^-webkit-/i"`) are treated as regular expressions, allowing regex patterns in JSON config files.

Given: `{ ignore: ["-webkit-keyframes"] }`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
@-webkit-keyframes fade {
	from { opacity: 0 }
	to { opacity: 1 }
}
```

## Prior art

- [`no-vendor-prefixes` rules in stylelint](https://stylelint.io/user-guide/rules)
