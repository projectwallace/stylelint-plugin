# Max unique custom properties

Limit the number of unique custom properties declared across the stylesheet.

<!-- prettier-ignore -->
```css
:root { --color-red: red; }
/*  ↑
*   counts as one of the unique custom properties */
```

A unique custom property is counted by its name, which is case-sensitive. Declaring the same custom property multiple times (for example for a dark theme or inside a media query) counts once. Only declarations are counted, not usages in `var()` or `@property` registrations.

A very large number of custom properties can slow down style recalculation and makes a design system harder to understand. This rule helps keep the set of tokens manageable.

## Options

### `Number` (required)

The maximum number of unique custom properties allowed. Must be a non-negative integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
:root { --color-red: red; }
:root { --color-blue: blue; }
:root { --color-green: green; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
:root { --color-red: red; }
:root { --color-blue: blue; }
:root { --color-red: red; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

Strings wrapped in `/` delimiters (e.g. `"/^foo/"`, `"/^foo/i"`) are treated as regular expressions. This allows regex patterns in JSON config files without needing a `.mjs` config.

A list of values to exclude from the count. Each entry can be an exact string or a regular expression, and is matched against the same value that is counted by this rule.

Given:

`[1, { "ignore": ["--a"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
:root { --a: 1; }
:root { --b: 1; }
```
