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

### `ignore: Array<string | RegExp | "single-value">`

Allows specific shorthand properties or patterns to be used. Accepts exact strings, regular expressions, or the special keyword `"single-value"`.

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
