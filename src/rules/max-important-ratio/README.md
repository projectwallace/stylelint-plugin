# Max important ratio

Prevent the ratio of `!important` declarations from exceeding a predefined maximum.

<!-- prettier-ignore -->
```css
a { color: red !important; }
/*                ↑
*   !important declarations count towards the ratio */
```

This rule calculates the **ratio of declarations** that use `!important` out of all declarations in the stylesheet. Overusing `!important` makes CSS harder to maintain and debug.

## Options

`Number`

The option must be between `0` and `1`, where `0` means no `!important` declarations are allowed and `1` means all declarations may use `!important`.

Given:

`0.5`

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
