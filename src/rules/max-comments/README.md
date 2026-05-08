# Max comments

Prevent the total number of comments from exceeding a predefined limit.

<!-- prettier-ignore -->
```css
/* This is a comment */
/*  ↑
*   each comment is counted */
```

This rule counts the **total number** of all CSS comments in the stylesheet.

## Options

`Number`

Given:

`1`

the following are considered violations:

<!-- prettier-ignore -->
```css
/* first comment */
/* second comment */
a { color: red; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
```

<!-- prettier-ignore -->
```css
/* only one comment */
a { color: red; }
```

## Optional secondary options

### `ignoreCopyrightComments: true`

Ignores copyright comments from the total count. A copyright comment is one that starts with `/*!`.

Given:

`[0, { ignoreCopyrightComments: true }]`

The following pattern is _not_ considered a violation:

<!-- prettier-ignore -->
```css
/*! Copyright 2024 My Company. All rights reserved. */
a { color: red; }
```
