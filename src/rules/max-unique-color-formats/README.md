# max-unique-color-formats

Limit the number of distinct color formats used across the stylesheet.

<!-- prettier-ignore -->
```css
.a { color: red; }
.b { color: #00f; }
.c { color: rgb(0, 128, 0); }
/*            ↑
 *   mixing hex, named, and rgb formats */
```

When a stylesheet mixes `hex`, `rgb`, `rgba`, `hsl`, `hsla`, `named`, `oklch`, and other formats, it's a signal that there's no agreed-upon color convention. Mixed formats make colors harder to compare visually in code review and harder to grep for.

Formats are the ones the [css-analyzer](https://github.com/projectwallace/css-analyzer) reports: hex colors are told apart by length (`hex3`, `hex6`, `hex8`, ...), `transparent` and `currentcolor` are formats of their own, and colors are found in every declaration, also in custom properties and in properties that are not color properties.

## Options

`number` (positive integer)

Given: `2`

the following are considered violations:

<!-- prettier-ignore -->
```css
/* 4 different formats — named, hex, rgb, hsl */
.a { color: red; }
.b { color: #00f; }
.c { color: rgb(0, 128, 0); }
.d { color: hsl(60, 100%, 50%); }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
/* 1 format — all hsl */
.a { color: hsl(0, 100%, 50%); }
.b { color: hsl(240, 100%, 50%); }
.c { color: hsl(120, 25%, 25%); }
.d { color: hsl(60, 100%, 50%); }
```

<!-- prettier-ignore -->
```css
/* 2 formats — named + hex, within the limit of 2 */
.a { color: transparent; }
.b { color: #ff0000; }
.c { color: #0000ff; }
```
