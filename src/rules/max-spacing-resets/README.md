# Max spacing resets

Limit the number of spacing reset declarations across the stylesheet.

<!-- prettier-ignore -->
```css
a { margin: 0; }
/*          ↑
*   This counts as a spacing reset */
```

Overusing spacing resets (setting `margin` or `padding` to `0`) can indicate over-reliance on resets rather than intentional spacing design. This rule helps enforce that resets are used sparingly.

A spacing reset is any declaration of a `margin` or `padding` property (including longhand and logical variants) whose value contains only zero values.

## Options

### `Number` (required)

The maximum number of spacing resets allowed. Must be a non-negative integer. Setting `0` enforces that no spacing resets are used at all.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { margin: 0; }
b { padding: 0; }
c { margin-top: 0; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { margin: 0; }
b { padding: 0; }
```
