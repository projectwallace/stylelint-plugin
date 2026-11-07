# no-unused-font-faces

Disallow `@font-face` rules whose font family is never referenced in a `font-family` or `font` declaration.

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; src: url(inter.woff2); }
/*                        ↑
*                         this family */
```

Declaring a `@font-face` for a family that no rule uses is dead code. It adds to the file size and signals that a font was removed from the design without cleaning up its declaration. This rule reports every `@font-face` whose `font-family` name does not appear in a `font-family` declaration, the `font` shorthand, or an `@font-feature-values` prelude. Family names are compared case-insensitively and quotes are ignored.

Because a family name may be hidden inside a custom property (`--font: Inter, sans-serif`) or a `var()` fallback, any name mentioned in those places counts as used.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; src: url(inter.woff2); }
body { font-family: Arial, sans-serif; }
```

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; font-weight: 400; src: url(inter-regular.woff2); }
@font-face { font-family: Inter; font-weight: 700; src: url(inter-bold.woff2); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; src: url(inter.woff2); }
body { font-family: Inter, sans-serif; }
```

<!-- prettier-ignore -->
```css
@font-face { font-family: "Open Sans"; src: url(open-sans.woff2); }
body { font: 16px/1.5 "Open Sans", sans-serif; }
```

<!-- prettier-ignore -->
```css
@font-face { font-family: Inter; src: url(inter.woff2); }
:root { --font-body: Inter, sans-serif; }
```

### Secondary options

`{ ignore: ["/regex/", "non-regex"] }`

Ignore specific font family names by exact string or regular expression.

Given: `{ ignore: ["Icons", /^Brand/] }`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@font-face { font-family: Icons; src: url(icons.woff2); }
@font-face { font-family: Brand-Display; src: url(brand.woff2); }
```

## Prior art

- [`no-unused-keyframes`](../no-unused-keyframes/README.md) — same concept applied to `@keyframes`
