# Max lines of code

Prevent a stylesheet from exceeding a predefined number of lines of code.

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
/*                ↑
*   each line with actual CSS counts towards the total */
```

This rule counts **source lines of code** (SLOC) — blank lines and comment-only lines are excluded from the count.

## Options

`Number`

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a {
  color: green;
}

a {
  color: red;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a {}
```

<!-- prettier-ignore -->
```css
a { color: red; }
```
