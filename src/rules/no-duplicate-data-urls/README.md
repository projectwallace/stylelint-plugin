# No duplicate data URLs

Disallow the same data URL from being used more than once.

<!-- prettier-ignore -->
```css
thing {
  -webkit-mask-image: url(data:image/svg+xml,...);
  mask-image: url(data:image/svg+xml,...);
/*            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
}
```

Repeating a large data URL increases file size unnecessarily. Store the data URL in a custom property once and reuse it with `var()`.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
thing {
  -webkit-mask-image: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E);
  mask-image: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E);
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
:root {
  --icon: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E);
}

thing {
  -webkit-mask-image: var(--icon);
  mask-image: var(--icon);
}
```
