# Max unique layers

Limit the number of unique `@layer` names used across the stylesheet.

<!-- prettier-ignore -->
```css
@layer reset { a { margin: 0; } }
/*  ↑
*   counts as one of the unique layers */
```

A unique layer is counted by its fully qualified name, so `@layer a { @layer b {} }` declares `a` and `a.b`. Layers declared in an order statement (`@layer a, b;`), as a block (`@layer a { … }`) or via `@import url() layer(a)` all count, and the same layer is only counted once. Anonymous layers are not counted.

A large number of layers makes the cascade harder to reason about. This rule helps keep the layer structure small and understandable.

## Options

### `Number` (required)

The maximum number of unique layers allowed. Must be a non-negative integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
@layer reset { a { margin: 0; } }
@layer base { a { color: red; } }
@layer components { a { color: blue; } }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@layer reset { a { margin: 0; } }
@layer base { a { color: red; } }
@layer reset { a { margin: 0; } }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

Strings wrapped in `/` delimiters (e.g. `"/^foo/"`, `"/^foo/i"`) are treated as regular expressions. This allows regex patterns in JSON config files without needing a `.mjs` config.

A list of values to exclude from the count. Each entry can be an exact string or a regular expression, and is matched against the same value that is counted by this rule.

Given:

`[1, { "ignore": ["a"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
@layer a { x { color: red; } }
@layer b { x { color: red; } }
```
