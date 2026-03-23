# Max average declarations per rule

Prevent the average number of declarations per rule from exceeding a predefined maximum.

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1em; }
b { color: blue; }
/*         ↑
*   all declarations across all rules count towards the average */
```

This rule calculates the **average number of declarations** across all style rules in the stylesheet.

## Options

`Number`

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1em; line-height: 1.5; }
b { color: blue; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
```

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1em; }
```
