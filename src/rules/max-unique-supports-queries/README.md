# Max unique supports queries

Limit the number of unique supports queries used across the stylesheet.

<!-- prettier-ignore -->
```css
@supports (display: grid) { }
/*         ↑↑↑↑↑↑↑↑↑↑↑↑↑↑
*   This value counts as one unique supports query */
```

Using too many different `@supports` conditions can indicate inconsistent feature detection patterns. This rule helps enforce a controlled set of feature queries.

A unique supports query is the entire params string of a `@supports` rule (everything after `@supports`). The same string used in multiple places counts only once.

## Options

### `Number` (required)

The maximum number of unique supports queries allowed. Must be a non-negative integer. Setting `0` enforces that no supports queries are used at all.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
@supports (display: grid) { }
@supports (display: flex) { }
@supports (display: contents) { }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@supports (display: grid) { a { color: red; } }
@supports (display: grid) { b { color: blue; } }
/* Both rules share the same supports query → only 1 unique entry */
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of supports query values to exclude from the count. Each entry can be an exact string or a regular expression matched against the full params string.

Given:

`[2, { "ignore": ["(display: grid)"] }]`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
@supports (display: grid) { }  /* ignored */
@supports (display: flex) { }
@supports (display: contents) { }
```
