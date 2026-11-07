# Max unique attribute selectors

Limit the number of unique attribute selectors used across the stylesheet.

<!-- prettier-ignore -->
```css
[type="text"] { color: red; }
/*  ↑
*   counts as one of the unique attribute selectors */
```

A unique attribute selector is counted by its exact text, so `[type="text"]` and `[type="email"]` are two different selectors. Attribute selectors nested inside functional pseudo-classes such as `:is()` and `:not()` are counted too.

Attribute selectors are tied to the markup and are a common source of tight coupling between HTML and CSS. A large set of distinct attribute selectors is often a sign that classes or data attributes should be used more consistently. This rule helps keep the set small.

## Options

### `Number` (required)

The maximum number of unique attribute selectors allowed. Must be a non-negative integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
[type="text"] { color: red; }
[type="email"] { color: red; }
[type="url"] { color: red; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
[type="text"] { color: red; }
[type="email"] { color: red; }
[type="text"] { color: red; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

Strings wrapped in `/` delimiters (e.g. `"/^foo/"`, `"/^foo/i"`) are treated as regular expressions. This allows regex patterns in JSON config files without needing a `.mjs` config.

A list of values to exclude from the count. Each entry can be an exact string or a regular expression, and is matched against the same value that is counted by this rule.

Given:

`[1, { "ignore": ["[type=\"text\"]"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
[type="text"] { color: red; }
[type="email"] { color: red; }
```
