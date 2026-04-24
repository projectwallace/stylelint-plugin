# Max unique media queries

Limit the number of unique media queries used across the stylesheet.

<!-- prettier-ignore -->
```css
@media (max-width: 768px) { }
/*     ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
*   This value counts as one unique media query */
```

Using too many different media query conditions can indicate an inconsistent set of responsive breakpoints. This rule helps enforce a controlled set of breakpoints derived from your design system.

A unique media query is the entire params string of an `@media` rule (everything after `@media`). The same string used in multiple places counts only once.

## Options

### `Number` (required)

The maximum number of unique media queries allowed. Must be a non-negative integer. Setting `0` enforces that no media queries are used at all.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
@media (max-width: 768px) { }
@media (min-width: 1024px) { }
@media (min-width: 1440px) { }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@media (max-width: 768px) { a { color: red; } }
@media (max-width: 768px) { b { color: blue; } }
/* Both rules share the same media query → only 1 unique entry */
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of media query values to exclude from the count. Each entry can be an exact string or a regular expression matched against the full params string.

Given:

`[2, { "ignore": ["(max-width: 768px)"] }]`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
@media (max-width: 768px) { }  /* ignored */
@media (min-width: 1024px) { }
@media (min-width: 1440px) { }
```
