# Max unique durations

Limit the number of unique duration values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { animation-duration: 1s; }
/*                      ↑
*   "1s" counts as a unique duration */
```

Using too many different duration values can indicate an inconsistent design system. This rule helps enforce a controlled set of timing values.

Each individual duration value is counted separately. Comma-separated lists (e.g. `animation-duration: 1s, 2s`) are split into individual durations.

The following CSS properties are checked:

- `animation-duration`
- `transition-duration`
- `animation` (shorthand)
- `transition` (shorthand)

> **Note**: Durations are compared by their exact string value. `1s` and `1000ms` are treated as two distinct durations.

## Options

### `Number` (required)

The maximum number of unique duration values allowed. Must be a positive integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { animation-duration: 1s; }
b { animation-duration: 2s; }
c { animation-duration: 3s; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a { animation-duration: 1s; }
b { transition-duration: 1s; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

Strings wrapped in `/` delimiters (e.g. `"/^red/"`, `"/^red/i"`) are treated as regular expressions. This allows regex patterns in JSON config files without needing a `.mjs` config.

A list of duration values to exclude from the count. Each entry can be an exact string or a regular expression.

> **Note**: String patterns are matched against the exact string value of the detected duration.

Given:

`[1, { "ignore": ["1s"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a { animation-duration: 1s; }
b { animation-duration: 2s; }
```

## Prior art

- [StyleStats](https://github.com/humanmade/stylestats) — CSS statistics and complexity analysis tool
- [Wallace CSS analyzer](https://www.projectwallace.com) — the CSS analysis engine powering this plugin
