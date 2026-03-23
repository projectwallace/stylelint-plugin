# Max comment size

Prevent the total size of all comments from exceeding a predefined number of bytes.

<!-- prettier-ignore -->
```css
/* This is a comment */
/*  ↑
*   the total size of all comments is counted */
```

This rule counts the **total byte size** of all CSS comments in the stylesheet.

## Options

`Number`

Given:

`10`

the following are considered violations:

<!-- prettier-ignore -->
```css
/* This is a long comment */
a { color: red; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
```

<!-- prettier-ignore -->
```css
/* short */
a { color: red; }
```
