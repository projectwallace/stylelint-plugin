# No anonymous layers

Disallow anonymous (unnamed) `@layer` blocks.

<!-- prettier-ignore -->
```css
@layer reset, utilities;

@layer {
/* ---^ */
  * {
    margin: 0;
  }
}
```

An anonymous `@layer` block has no name and cannot be referenced or extended later. This makes CSS harder to maintain and reason about, as the layer cannot be ordered relative to other layers or extended in other stylesheets.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
@layer { * { margin: 0; } }
```

<!-- prettier-ignore -->
```css
@import url(test.css) layer;
```

<!-- prettier-ignore -->
```css
@import url(test.css) layer (min-width: 1000px);
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@layer reset { * { margin: 0; } }
```

<!-- prettier-ignore -->
```css
@layer reset, utilities;
@layer reset { * { margin: 0; } }
@layer utilities { .u-flex { display: flex; } }
```

<!-- prettier-ignore -->
```css
@import url(test.css) layer(mobile) supports(display: grid);
```
