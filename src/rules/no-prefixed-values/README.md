# No prefixed values

Disallow vendor-prefixed CSS values.

<!-- prettier-ignore -->
```css
a { display: -webkit-flex }
/*           ↑
*            This vendor-prefixed value is not allowed */
```

Vendor-prefixed values like `-webkit-flex` or `-webkit-linear-gradient()` are outdated and should be replaced with their standard equivalents or managed through a build tool like Autoprefixer. This rule flags prefixed values that have standardized replacements.

## Options

`true`

The following are considered violations:

<!-- prettier-ignore -->
```css
a {
	display: -webkit-flex;
}
```

<!-- prettier-ignore -->
```css
a {
	background: -webkit-linear-gradient(top, red, blue);
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a {
	display: flex;
}
```

<!-- prettier-ignore -->
```css
a {
	background: linear-gradient(to bottom, red, blue);
}
```

### `ignore: Array<string | RegExp>`

Ignore specific vendor-prefixed values by exact string or regular expression.

Given: `{ ignore: ["-webkit-fill-available"] }`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
a {
	width: -webkit-fill-available;
}
```
