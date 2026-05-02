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

### `ignore: [/regex/, "non-regex"]`

Ignore specific unused custom properties.

Given:

```js
;['--ignored']
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

### `importFrom: ["path/to/file.css", { filePath: "path/to/other.css" }]`

Load `var()` usages from external CSS files. Any custom property consumed via `var()` in those files counts as "used", preventing false positives when a tokens file declares variables that are only consumed by separate component stylesheets.

Each entry is either a file path string or an object with a `filePath` key.

Given `component.css`:

<!-- prettier-ignore -->
```css
a {
	color: var(--brand-color);
	font-family: var(--brand-font);
}
```

And the config:

```js
;[true, { importFrom: ['component.css'] }]
```

The following are considered problems:

<!-- prettier-ignore -->
```css
:root { --never-used: 1; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
:root {
	--brand-color: #c0ffee;
	--brand-font: 'Comic Sans MS';
	/* ↑ both are used in component.css */
}
```

## Credits

`importFrom` inspired by the same option in [csstools/postcss-custom-properties](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-properties).
