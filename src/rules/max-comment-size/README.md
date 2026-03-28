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

## Optional secondary options

### `ignoreCopyrightComments: true`

Ignores copyright comments from the total byte count. A copyright comment is one that starts with `/*!`.

Given:

`[10, { ignoreCopyrightComments: true }]`

The following patterns is _not_ considered a violation:

<!-- prettier-ignore -->
```css
/*! Copyright 2024 My Company. All rights reserved. */
a { color: red; }
```
