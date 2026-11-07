# no-duplicate-font-faces

Disallow multiple `@font-face` rules that describe the same font face.

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; src: url(a.woff2); }
@font-face { font-family: Inter; src: url(b.woff2); }
/*          ↑
*           this face was already declared above */
```

Two `@font-face` rules with the same `font-family`, `font-weight`, `font-style`, `font-stretch` and `unicode-range` compete for the same face. The browser only uses the last one, so the other is dead weight that still adds to the file size and can hide copy-paste mistakes (for example a forgotten `font-weight` on a bold variant).

Omitted descriptors are compared by their default value (`font-weight: 400`, `font-style: normal`, `font-stretch: 100%`), `bold` is treated as `700`, family names are compared case-insensitively and ignoring quotes.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; src: url(a.woff2); }
@font-face { font-family: Inter; src: url(b.woff2); }
```

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; font-weight: bold; src: url(a.woff2); }
@font-face { font-family: Inter; font-weight: 700; src: url(b.woff2); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; font-weight: 400; src: url(regular.woff2); }
@font-face { font-family: Inter; font-weight: 700; src: url(bold.woff2); }
```

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; unicode-range: U+0000-00FF; src: url(latin.woff2); }
@font-face { font-family: Inter; unicode-range: U+0400-045F; src: url(cyrillic.woff2); }
```

## Prior art

- [`no-duplicate-keyframes`](../no-duplicate-keyframes/README.md) — same concept applied to `@keyframes`
- [`no-duplicate-registered-properties`](../no-duplicate-registered-properties/README.md) — same concept applied to `@property`
