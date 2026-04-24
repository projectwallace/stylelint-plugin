# Max unique keyframes

Limit the number of unique keyframe animations defined across the stylesheet.

<!-- prettier-ignore -->
```css
@keyframes fade-in { }
/*          ↑↑↑↑↑↑↑
*   This name counts as one unique keyframe */
```

Using too many different keyframe animations can indicate an inconsistent animation system. This rule helps enforce a controlled set of animations derived from your design system.

A unique keyframe is the name used in an `@keyframes` rule. The same name used in multiple `@keyframes` blocks counts only once.

## Options

### `Number` (required)

The maximum number of unique keyframes allowed. Must be a non-negative integer. Setting `0` enforces that no keyframes are defined at all.

Given:

`2`

the following are considered violations:

<!-- prettier-ignore -->
```css
@keyframes fade-in { }
@keyframes fade-out { }
@keyframes slide-in { }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@keyframes fade-in { from { opacity: 0; } }
@keyframes fade-in { to { opacity: 1; } }
/* Both rules share the same keyframe name → only 1 unique entry */
```

### Vendor-prefixed keyframes

Vendor-prefixed at-rules such as `@-webkit-keyframes` are not counted. Only unprefixed `@keyframes` rules are considered.

<!-- prettier-ignore -->
```css
@keyframes foo { }           /* counted */
@-webkit-keyframes foo { }   /* ignored */
```

### `ignore` (optional)

Type: `Array<string | RegExp>`

A list of keyframe names to exclude from the count. Each entry can be an exact string or a regular expression matched against the full keyframe name.

Given:

`[2, { "ignore": ["fade-in"] }]`

the following are _not_ considered violations:

<!-- prettier-ignore -->
```css
@keyframes fade-in { }  /* ignored */
@keyframes fade-out { }
@keyframes slide-in { }
```
