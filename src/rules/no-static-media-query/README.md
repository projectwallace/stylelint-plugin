# No Static Media Query

Disallow media features that use an exact equality value — e.g. `(width: 300px)` — instead of a range condition.

<!-- prettier-ignore -->
```css
@media (width: 300px) {}
/*      ↑
*       This condition can only be true when the viewport is exactly 300px wide */
```

A feature like `(width: 300px)` is equivalent to both `(min-width: 300px)` and `(max-width: 300px)` simultaneously. It can only match at a single exact pixel value, which makes it practically useless in real stylesheets. When combined with another conflicting bound — e.g. `(min-width: 400px)` — the query becomes a logical contradiction that can never match.

Use range conditions such as `(min-width: 300px)`, `(max-width: 300px)`, or the modern range syntax `(width >= 300px)` instead.

Both `@media` and `@import` rules are checked.

## Options

### `true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
/* equality syntax on its own */
@media (width: 300px) {}
```

<!-- prettier-ignore -->
```css
/* equality width alongside a conflicting min-width */
@media (width: 300px) and (min-width: 400px) {}
```

<!-- prettier-ignore -->
```css
/* equality width alongside a conflicting max-width */
@media (width: 300px) and (max-width: 200px) {}
```

<!-- prettier-ignore -->
```css
/* equality width alongside an exclusive range bound at the same value */
@media (width: 300px) and (width > 300px) {}
```

<!-- prettier-ignore -->
```css
/* equality height */
@media (height: 300px) {}
```

<!-- prettier-ignore -->
```css
/* logical property: inline-size */
@media (inline-size: 300px) {}
```

<!-- prettier-ignore -->
```css
/* @import with equality syntax */
@import url(narrow.css) (width: 300px);
```

<!-- prettier-ignore -->
```css
/* works for any numeric unit, not just px */
@media (width: 30em) {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
/* range condition using min-/max- prefix */
@media (min-width: 300px) {}
```

<!-- prettier-ignore -->
```css
/* modern range syntax */
@media (width >= 300px) {}
```

<!-- prettier-ignore -->
```css
/* double-sided range */
@media (100px <= width <= 1000px) {}
```

<!-- prettier-ignore -->
```css
/* keyword feature (non-numeric) */
@media (prefers-color-scheme: dark) {}
```

<!-- prettier-ignore -->
```css
/* queries with `not` are skipped to avoid false positives */
@media not screen {}
```
