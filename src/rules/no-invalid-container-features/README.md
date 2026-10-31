# no-invalid-container-features

Disallow `@container` features that the named container cannot be queried for.

<!-- prettier-ignore -->
```css
.card { container: card / inline-size; }
@container card (height > 300px) {}
/*                ↑
*                 `height` needs container-type: size */
```

`container-type: inline-size` only contains the inline axis, so a query for `height`, `block-size`, `aspect-ratio` or `orientation` evaluates to "unknown" and never matches. Likewise, size features need `size` or `inline-size` (a `normal` container can't answer them) and `scroll-state()` needs `scroll-state` in `container-type`. The offending feature is reported wherever it appears, including inside `or` and `not`.

`style()` queries are always valid: every element is a style container, whatever its `container-type`.

Only _named_ queries are checked. A name is resolved to the union of all its declarations (including `referenceRoots`); if any declaration is unknown (`var()`, a global keyword, or a `container-name` without a `container-type` in the same rule) the name is skipped. Assumes a horizontal `writing-mode`.

## Options

### `true`

```json
{ "projectwallace/no-invalid-container-features": true }
```

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
.a { container: card / inline-size; }
@container card (min-height: 200px) {}
@container card (aspect-ratio > 1) {}
@container card (width > 400px) and (height > 200px) {}
```

<!-- prettier-ignore -->
```css
.b { container-name: box; container-type: normal; }
@container box (width > 400px) {}
```

<!-- prettier-ignore -->
```css
.c { container: sticky / inline-size; }
@container sticky scroll-state(stuck: top) {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.a { container: card / inline-size; }
@container card (width > 400px) {}
@container card style(--theme: dark) {}
@container (height > 200px) {}
```

<!-- prettier-ignore -->
```css
.b { container: card / size; }
@container card (height > 200px) and (aspect-ratio > 1) {}
```
