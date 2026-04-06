# Max unique colors

Limit the number of unique color values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { color: red; }
/*         ↑
*   "red" counts as a unique color */
```

Using too many different colors can indicate an inconsistent design system. This rule helps enforce a controlled color palette.

A unique color is counted by its exact string representation. Each of the following is detected as a color:

- Named colors: `red`, `blue`, `transparent`, `currentColor`, etc.
- Hex colors: `#f00`, `#ff0000`, `#ff000080`, etc.
- Color functions: `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`, `color-mix()`, `light-dark()`, etc.
- `var()` references to custom properties declared with `@property { syntax: '<color>' }`

> **Note**: Colors are compared by their exact string value. `#f00` and `#ff0000` are treated as two distinct colors even though they represent the same visual color.

## Options

### `Number` (required)

The maximum number of unique color values allowed. Must be a positive integer.

Given:

`3`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
c { color: green; }
d { color: yellow; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
b { background-color: red; }
c { border-color: blue; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of color values to exclude from the count. Each entry can be an exact string or a regular expression.

> **Note**: String patterns are matched against the exact string value of the detected color (preserving original casing).

Given:

`[2, { "ignore": ["transparent", "currentColor"] }]`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
a {
  color: red;
  background-color: transparent;
  border-color: currentColor;
  outline-color: blue;
}
```

## `var()` and `@property`

When a custom property is declared with `@property { syntax: '<color>' }`, any `var()` referencing it is recognised as a color value and counted as a unique color.

<!-- prettier-ignore -->
```css
@property --brand-color {
  syntax: '<color>';
  inherits: false;
  initial-value: #0070f3;
}

a { color: var(--brand-color); }
b { color: var(--brand-color); }  /* same var() expression → still 1 unique color */
```

If a `var()` has a fallback value, the fallback colors are counted separately:

<!-- prettier-ignore -->
```css
@property --brand-color {
  syntax: '<color>';
  inherits: false;
  initial-value: blue;
}

/* var(--brand-color, red) counts as 2 colors: the var() expression and "red" */
a { color: var(--brand-color, red); }
```

Without a `@property` declaration, `var()` is not counted (the actual color value is unknown at lint time), but any fallback values are still evaluated:

<!-- prettier-ignore -->
```css
/* var(--unknown) → not counted; "blue" fallback → counted as 1 color */
a { color: var(--unknown, blue); }
```
