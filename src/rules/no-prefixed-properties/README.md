# No prefixed properties

Disallow vendor-prefixed CSS properties.

<!-- prettier-ignore -->
```css
a { -webkit-transform: rotate(45deg) }
/*  ↑
*   This vendor-prefixed property is not allowed */
```

Vendor-prefixed properties like `-webkit-transform`, `-moz-appearance`, or `-ms-flex` indicate either stale CSS that predates broad support, or manual prefixing that should be handled by a build tool like Autoprefixer. This rule encourages the use of standard, unprefixed properties.

## Options

`true`

The following are considered violations:

<!-- prettier-ignore -->
```css
a {
	-webkit-transform: rotate(45deg);
}
```

<!-- prettier-ignore -->
```css
a {
	-moz-appearance: none;
}
```

<!-- prettier-ignore -->
```css
a {
	-ms-flex: 1;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a {
	transform: rotate(45deg);
}
```

<!-- prettier-ignore -->
```css
a {
	appearance: none;
}
```

### `ignore: Array<string | RegExp>`

Ignore specific vendor-prefixed properties by exact string or regular expression.

Given: `{ ignore: ["-webkit-appearance"] }`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
a {
	-webkit-appearance: none;
}
```
