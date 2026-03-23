# Max important ratio

Prevent the ratio of `!important` declarations from exceeding a predefined percentage.

<!-- prettier-ignore -->
```css
a { color: red !important; }
/*                ↑
*   !important declarations count towards the ratio */
```

This rule calculates the **percentage of declarations** that use `!important` out of all declarations in the stylesheet. Overusing `!important` makes CSS harder to maintain and debug.

## Options

`Number`

Given:

`50`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red !important; font-size: 1em !important; }
b { color: blue; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red !important; }
b { color: blue; font-size: 1em; }
```

<!-- prettier-ignore -->
```css
a { color: red; }
```
