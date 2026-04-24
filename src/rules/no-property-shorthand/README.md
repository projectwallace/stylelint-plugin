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

### `ignore: Array<string | RegExp>`

Allows specific shorthand properties to be used. Accepts exact strings or regular expressions.

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
