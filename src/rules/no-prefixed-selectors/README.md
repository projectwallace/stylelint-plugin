# No prefixed selectors

Disallow vendor-prefixed pseudo-classes and pseudo-elements in selectors.

<!-- prettier-ignore -->
```css
input::-webkit-input-placeholder { color: grey }
/*     ↑
*      This vendor-prefixed pseudo-element is not allowed */
```

Vendor-prefixed selectors like `::-webkit-input-placeholder` or `::-moz-selection` target engine-specific internals and are outdated. Standard equivalents like `::placeholder` and `::selection` have broad browser support and should be used instead.

## Options

`true`

The following are considered violations:

<!-- prettier-ignore -->
```css
input::-webkit-input-placeholder {
	color: grey;
}
```

<!-- prettier-ignore -->
```css
::-moz-selection {
	background: blue;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
input::placeholder {
	color: grey;
}
```

<!-- prettier-ignore -->
```css
::selection {
	background: blue;
}
```

### `ignore: Array<string | RegExp>`

Ignore specific vendor-prefixed pseudo-classes or pseudo-elements by exact string or regular expression.

Given: `{ ignore: ["::-webkit-scrollbar"] }`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
::-webkit-scrollbar {
	width: 8px;
}
```
