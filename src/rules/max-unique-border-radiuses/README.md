# Max unique border radiuses

Limit the number of unique `border-radius` values used across the stylesheet.

<!-- prettier-ignore -->
```css
a { border-radius: 4px; }
/*  ↑
*   counts as one of the unique border radiuses */
```

A unique border radius is counted by its value, with whitespace normalized: `2px  4px` is the same as `2px 4px`, and `4px/3px` is the same as `4px / 3px`. Values with multiple radii (`2px 4px`) and with a slash for elliptical corners (`4px / 3px`) each count as one unique value, and `2px`, `2px 4px` and `4px / 3px` are three different values. Global keywords (`inherit`, `initial`, `unset`, …) are not counted. The following properties are checked:

- `border-radius`
- `border-top-left-radius`, `border-top-right-radius`, `border-bottom-left-radius`, `border-bottom-right-radius`
- `border-start-start-radius`, `border-start-end-radius`, `border-end-start-radius`, `border-end-end-radius`

Using many different border radii usually means the design system has no scale for rounding. This rule helps keep the set of radii small and intentional.

## Options

### `Number` (required)

The maximum number of unique border radiuses allowed. Must be a positive integer.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { border-radius: 4px; }
b { border-radius: 8px; }
c { border-radius: 16px; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a { border-radius: 4px; }
b { border-radius: 8px; }
a { border-radius: 4px; }
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

Strings wrapped in `/` delimiters (e.g. `"/^foo/"`, `"/^foo/i"`) are treated as regular expressions. This allows regex patterns in JSON config files without needing a `.mjs` config.

A list of values to exclude from the count. Each entry can be an exact string or a regular expression, and is matched against the same value that is counted by this rule.

Given:

`[1, { "ignore": ["2px"] }]`

the following is _not_ considered a violation:

<!-- prettier-ignore -->
```css
a { border-radius: 2px; }
b { border-radius: 4px; }
```
