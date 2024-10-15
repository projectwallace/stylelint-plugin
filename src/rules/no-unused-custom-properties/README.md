# No unused custom properties

Disallow custom properties that are never used in a `var()`.

<!-- prettier-ignore -->
```css
a {
	--unused: 2;
	color: var(--used);

	--used: 1;
/**  ↑ Declared property, but never used in var() */
}
```

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
a { --unused: 1; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a {
	--my-color: green;
	color: var(--my-color);
	/*         ↑ directly used in this var() */
}
```

```css
a {
  --my-fallback: green;
  color: var(--unkown-property, var(--my-fallback));
  /*                            ↑ used as fallback property in var() */
}
```

## Optional secondary options

### `ignoreProperties: [/regex/, "non-regex"]`

Ignore specific unused custom properties.

Given:

```js
["--ignored"];
```

The following are considered problems:

<!-- prettier-ignore -->
```css
a { --unused: 1; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a { --ignored: green; }
```
