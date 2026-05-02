# No Unreachable Media Conditions

Disallow media queries that contain logically contradictory conditions — combinations of feature constraints that can never all be satisfied at the same time.

<!-- prettier-ignore -->
```css
@media (min-width: 1000px) and (max-width: 500px) {}
/*                ↑                          ↑
*                 These conditions can never both be true */
```

This catches dead code introduced by copy-paste errors or misconfigured breakpoints. Both the legacy `min-width`/`max-width` syntax and the modern range syntax (`width > X`) are supported, for any numeric media feature including logical properties, pixel ratios, and dimensions. `@import` rules with media conditions are also checked.

## Options

### `true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
/* min-width exceeds max-width */
@media (min-width: 1000px) and (max-width: 500px) {}
```

<!-- prettier-ignore -->
```css
/* media type does not affect the width contradiction */
@media screen and (min-width: 1020px) and (max-width: 739px) {}
```

<!-- prettier-ignore -->
```css
/* range syntax: equal exclusive bounds */
@media (width > 1000px) and (width < 1000px) {}
```

<!-- prettier-ignore -->
```css
/* range syntax: impossible range */
@media (width >= 1000px) and (width <= 500px) {}
```

<!-- prettier-ignore -->
```css
/* double-sided range conflicts with separate min-width */
@media (500px <= width <= 800px) and (min-width: 1000px) {}
```

<!-- prettier-ignore -->
```css
/* logical property: inline-size */
@media (min-inline-size: 1000px) and (max-inline-size: 400px) {}
```

<!-- prettier-ignore -->
```css
/* device-pixel-ratio */
@media (min-resolution: 3dppx) and (max-resolution: 1dppx) {}
```

<!-- prettier-ignore -->
```css
/* height */
@media (min-height: 800px) and (max-height: 400px) {}
```

<!-- prettier-ignore -->
```css
/* @import with contradictory media condition */
@import url(narrow.css) (400px <= width <= 200px);
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
/* valid min/max range */
@media (min-width: 100px) and (max-width: 1000px) {}
```

<!-- prettier-ignore -->
```css
/* comma-separated queries are independent */
@media (min-width: 1000px), (max-width: 500px) {}
```

<!-- prettier-ignore -->
```css
/* different features are not compared */
@media (min-width: 1000px) and (max-height: 500px) {}
```

<!-- prettier-ignore -->
```css
/* queries with `not` are skipped to avoid false positives */
@media not screen {}
```

<!-- prettier-ignore -->
```css
/* valid @import media condition */
@import url(wide.css) (min-width: 600px) and (max-width: 1200px);
```

## Credits

Idea for this rule came from [@andydavies](https://github.com/andydavies) via [Bluesky](https://bsky.app/profile/andydavies.me/post/3lgvt5gjyxc2e)
