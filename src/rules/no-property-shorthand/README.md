# No Property Shorthand

Disallow the use of [shorthand properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties). Shorthand properties set multiple CSS properties at once, which can lead to unintended overrides of previously set values. See [CSS Shorthand Syntax Considered an Anti-Pattern](https://csswizardry.com/2016/12/css-shorthand-syntax-considered-an-anti-pattern/).

<!-- prettier-ignore -->
```css
a { background: red; }
/*  ↑
*   Shorthand property not allowed */
```

The following are considered violations:

<!-- prettier-ignore -->
```css
a {
	background: red;
}
```

<!-- prettier-ignore -->
```css
a {
	border: 1px solid red;
}
```

<!-- prettier-ignore -->
```css
a {
	font: bold 16px/1.5 sans-serif;
}
```

## Options

### `disallow: Array<string | RegExp>`

Restricts the rule to only flag the specified shorthand properties. When set, all other shorthands are permitted. Accepts exact strings, regular expressions, or strings wrapped in `/` delimiters treated as regular expressions.

This is the inverse of `ignore` — instead of listing every shorthand you want to allow, you list only the few you want to forbid.

<!-- prettier-ignore -->
```json
[true, { "disallow": ["font", "animation", "transition"] }]
```

The following are _not_ considered violations when `disallow: ["font", "animation", "transition"]` is set:

<!-- prettier-ignore -->
```css
a {
	background: red;
}
```

<!-- prettier-ignore -->
```css
a {
	border: 1px solid red;
}
```

The following _are_ still violations:

<!-- prettier-ignore -->
```css
a {
	font: bold 16px/1.5 sans-serif;
}
```

<!-- prettier-ignore -->
```css
a {
	animation: foo 1s ease;
}
```

`disallow` can be combined with `ignore: ["single-value"]` to additionally exempt single-value declarations from the disallowed set:

<!-- prettier-ignore -->
```json
[true, { "disallow": ["font"], "ignore": ["single-value"] }]
```

### `ignore: Array<string | RegExp | "single-value">`

Allows specific shorthand properties or patterns to be used. Accepts exact strings, regular expressions, the special keyword `"single-value"`, or strings wrapped in `/` delimiters (e.g. `"/^border/"`) which are treated as regular expressions — enabling regex patterns in JSON config files.

#### `"single-value"`

When `"single-value"` is included, shorthand properties with a single value token are allowed. This covers keyword-only values like `inherit` and function calls like `var(--foo)`.

<!-- prettier-ignore -->
```json
[true, { "ignore": ["single-value"] }]
```

The following are _not_ considered violations when `ignore: ["single-value"]` is set:

<!-- prettier-ignore -->
```css
a {
	font: inherit;
}
```

<!-- prettier-ignore -->
```css
a {
	margin-inline: var(--my-margin);
}
```

The following _is_ still a violation (multiple value tokens):

<!-- prettier-ignore -->
```css
a {
	font: bold 16px/1.5 sans-serif;
}
```

#### Property names and patterns

Allows specific shorthand properties by exact name or regular expression.

<!-- prettier-ignore -->
```json
[true, { "ignore": ["background", "/^border-/"] }]
```

The following are _not_ considered violations when `ignore: ["background"]` is set:

<!-- prettier-ignore -->
```css
a {
	background: red;
}
```

Both `"single-value"` and property names can be combined:

<!-- prettier-ignore -->
```json
[true, { "ignore": ["single-value", "background"] }]
```

## Patterns

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a {
	background-color: red;
}
```

<!-- prettier-ignore -->
```css
a {
	border-width: 1px;
	border-style: solid;
	border-color: red;
}
```

## Prior art

- stylelint's [`shorthand-property-no-redundant-values`](https://stylelint.io/user-guide/rules/shorthand-property-no-redundant-values) rule
