# No useless custom property assignment

Disallow custom property assignments that reference themselves via `var()`.

<!-- prettier-ignore -->
```css
:root {
	--color: var(--color);
	/**      ↑ This var() references the same property being declared */
}
```

This rule catches two patterns:

1. **Self-assignment** — a custom property assigned directly to itself:

<!-- prettier-ignore -->
```css
:root { --color: var(--color); }
```

2. **Fallback self-reference** — a custom property appearing as a fallback in its own value:

<!-- prettier-ignore -->
```css
:root { --color-2: var(--color-1, var(--color-2)); }
```

Both patterns are useless because the custom property will always resolve to its initial value (or be invalid), making the `var()` reference pointless.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
:root { --color: var(--color); }
```

<!-- prettier-ignore -->
```css
:root {
	--color-1: green;
	--color-2: var(--color-1, var(--color-2));
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
:root {
	--color-1: red;
	--color-2: var(--color-1);
}
```

## Optional secondary options

### `allowList: [/regex/, "non-regex"]`

Allow specific custom properties to be exempt from this rule, by exact string or RegExp pattern.

Given:

<!-- prettier-ignore -->
```js
['--intentional-self-ref', /^--ds-/]
```

The following are considered problems:

<!-- prettier-ignore -->
```css
:root { --color: var(--color); }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
:root { --intentional-self-ref: var(--intentional-self-ref); }
```

<!-- prettier-ignore -->
```css
:root { --ds-color: var(--ds-color); }
```
