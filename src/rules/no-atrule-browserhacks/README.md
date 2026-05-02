# No at-rule browserhacks

Disallow the use of known browser hacks in `@media` and `@supports` at-rule preludes.

<!-- prettier-ignore -->
```css
@media \0screen { }
/*      ↑
*       At-rule browserhack not allowed */
```

Browser hacks in at-rule preludes like `\0screen` or `-webkit-appearance: none` target specific browser versions and add dead weight to stylesheets. This rule catches `@media` and `@supports` browser hacks, complementing `no-property-browserhacks` and `no-value-browserhacks`.

## Options

`true`

The following are considered violations:

<!-- prettier-ignore -->
```css
@media \0screen { }
```

<!-- prettier-ignore -->
```css
@media (-moz-images-in-menus: 0) { }
```

<!-- prettier-ignore -->
```css
@supports (-webkit-appearance: none) { }
```

<!-- prettier-ignore -->
```css
@supports (-moz-appearance: meterbar) { }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@media (min-width: 768px) { }
```

<!-- prettier-ignore -->
```css
@supports (display: grid) { }
```
