# No unused container names

Disallow container names that are declared but never used in a `@container` query.

<!-- prettier-ignore -->
```css
.sidebar {
	container-name: sidebar;
	/**             ↑ This container name is never queried */
}
```

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
.sidebar { container-name: sidebar; }
```

<!-- prettier-ignore -->
```css
.sidebar { container: sidebar / inline-size; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
.sidebar {
	container-name: sidebar;
	/*              ↑ used in the @container query below */
}
@container sidebar (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

<!-- prettier-ignore -->
```css
.sidebar {
	container: sidebar / inline-size;
	/*         ↑ shorthand, name part is used in the @container query below */
}
@container sidebar (min-width: 700px) {
	.card { font-size: 1rem; }
}
```

<!-- prettier-ignore -->
```css
/* container-name: none is not a real name */
.sidebar { container-name: none; }
```

## Optional secondary options

### `allowList: [/regex/, "non-regex"]`

Allow specific container names that are declared but never queried. Useful for container names intended to be queried in other stylesheets or by external tools.

Given:

<!-- prettier-ignore -->
```js
['sidebar', /^layout-/]
```

The following are considered problems:

<!-- prettier-ignore -->
```css
.wrapper { container-name: main-content; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
.sidebar { container-name: sidebar; }
```

<!-- prettier-ignore -->
```css
.layout { container-name: layout-header; }
```
