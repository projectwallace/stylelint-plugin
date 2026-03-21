# no-static-container-query

Disallow static (exact-match) numeric container feature conditions.

A static container query uses the equality syntax like `(width: 300px)`, which fixes the feature to a single exact value. Because containers are almost never exactly a specific pixel value, these queries are unreachable in practice. Use range syntax instead: `(width >= 300px)` or `(width <= 300px)`.

## Options

### `true`

```json
{ "projectwallace/no-static-container-query": true }
```

## Examples

The following patterns are considered problems:

```css
/* exact equality — almost never matches */
@container (width: 300px) {
	.foo {
		color: red;
	}
}
```

The following patterns are not considered problems:

```css
@container (width >= 300px) {
	.foo {
		color: red;
	}
}

@container (min-width: 300px) {
	.foo {
		color: red;
	}
}
```
