# Max nesting depth

Limit the maximum nesting depth of CSS rules and at-rules.

<!-- prettier-ignore -->
```css
.page {
  .sidebar {
    .nav { /* ← depth 2 */
      color: blue;
    }
  }
}
```

Deeply nested CSS makes stylesheets harder to read, increases specificity unpredictably, and often signals overly coupled component styles. This rule applies to both native CSS nesting and wrapping at-rules like `@media`, `@supports`, and `@container`.

## Options

### `Number` (required)

The maximum nesting depth allowed. Must be a non-negative integer. Setting `0` enforces that no nesting is used at all.

Given:

`1`

the following are considered violations:

<!-- prettier-ignore -->
```css
.page {
  .sidebar {
    .nav { /* depth 2 — violation */
      color: blue;
    }
  }
}
```

<!-- prettier-ignore -->
```css
@media (min-width: 600px) {
  @supports (display: grid) {
    .rule { /* depth 2 — violation */
      color: blue;
    }
  }
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.sidebar {
  .nav-link { /* depth 1 — ok */
    color: blue;
  }
}
```

<!-- prettier-ignore -->
```css
@media (min-width: 600px) {
  .sidebar { /* depth 1 — ok */
    color: blue;
  }
}
```
