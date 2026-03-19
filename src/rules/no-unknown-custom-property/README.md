# No unknown custom property

Disallow the use of undeclared custom properties in `var()`.

<!-- prettier-ignore -->
```css
a {
	color: var(--unknown);
	/**         ↑ This custom property was never declared */
}
```

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
a { color: var(--undeclared); }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a {
	--my-color: green;
	color: var(--my-color);
	/*         ↑ declared in this stylesheet */
}
```

<!-- prettier-ignore -->
```css
@property --my-color {
	syntax: '<color>';
	initial-value: green;
	inherits: false;
}
a {
	color: var(--my-color);
	/*         ↑ declared via @property */
}
```

## Optional secondary options

### `allowList: [/regex/, "non-regex"]`

Allow specific undeclared custom properties by exact string or RegExp pattern. Useful for custom properties defined externally (e.g. design tokens, theming systems) that are not declared in the stylesheet being linted.

Given:

```js
['--brand-color', /^--ds-/]
```

The following are considered problems:

<!-- prettier-ignore -->
```css
a { color: var(--undeclared); }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a { color: var(--brand-color); }
```

<!-- prettier-ignore -->
```css
a { color: var(--ds-color-primary); }
```

### `allowFallback: true`

Allow undeclared custom properties when the `var()` provides a fallback value. This is useful when consuming custom properties defined externally (e.g. design tokens, third-party libraries) while still ensuring a safe default.

The following are considered problems:

<!-- prettier-ignore -->
```css
a { color: var(--undeclared); }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a { color: var(--undeclared, red); }
/*                           ↑ fallback value present */
```

<!-- prettier-ignore -->
```css
a { color: var(--undeclared, var(--also-undeclared, red)); }
/*                           ↑ outer var() has a fallback, so --undeclared is allowed */
```
