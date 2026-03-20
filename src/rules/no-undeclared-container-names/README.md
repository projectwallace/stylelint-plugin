# No undeclared container names

Disallow container names in `@container` queries that were never declared with `container-name` or the `container` shorthand.

<!-- prettier-ignore -->
```css
@container sidebar (min-width: 700px) {
	/**        ↑ This container name was never declared */
	.card { font-size: 1rem; }
}
```

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
@container sidebar (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
.sidebar {
	container-name: sidebar;
	/*              ↑ declared here */
}
@container sidebar (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

<!-- prettier-ignore -->
```css
.sidebar {
	container: sidebar / inline-size;
	/*         ↑ declared via shorthand */
}
@container sidebar (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

<!-- prettier-ignore -->
```css
/* Anonymous @container queries (no name) are always allowed */
@container (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

## Optional secondary options

### `allowList: [/regex/, "non-regex"]`

Allow specific container names that are used in `@container` queries but not declared in the stylesheet. Useful for container names defined in another stylesheet or by an external system.

Given:

<!-- prettier-ignore -->
```js
['sidebar', /^layout-/]
```

The following are considered problems:

<!-- prettier-ignore -->
```css
@container main-content (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@container sidebar (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

<!-- prettier-ignore -->
```css
@container layout-header (min-width: 700px) {
	.card { font-size: 1rem; }
}
```
