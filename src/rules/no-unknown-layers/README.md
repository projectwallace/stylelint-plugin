# no-unknown-layers

Disallow `@layer` blocks whose name was not declared in the layer order statement.

<!-- prettier-ignore -->
```css
@layer reset, base;
@layer components { a { color: red; } }
/*     ↑
*      not in the order statement above */
```

An `@layer a, b, c;` statement defines the order in which layers are applied. A block like `@layer d { … }` that is not part of that statement creates a new layer at the end of the order, which is often a typo (`@layer compnents`) or a layer that was forgotten in the order statement. The result is a layer with a different precedence than intended, and no error from the browser.

This rule only checks scopes that have an order statement. Without an order statement (in the stylesheet itself or in a reference file) there is nothing to compare against, so nothing is reported. A layer also counts as declared when it appears in `@import … layer(name)`. Declaring `a.b` also declares `a`. Anonymous layers are ignored.

When linting with stylelint's `referenceFiles` option, layers declared in the reference files count as declared.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@layer reset, base;
@layer components { a { color: red; } }
```

<!-- prettier-ignore -->
```css
@layer framework;
@layer framework.base { a { color: red; } }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@layer reset, base, components;
@layer components { a { color: red; } }
```

<!-- prettier-ignore -->
```css
/* no order statement, so nothing to compare against */
@layer components { a { color: red; } }
```

### Secondary options

`{ ignore: ["/regex/", "non-regex"] }`

Ignore specific layer names by exact string or regular expression. Nested layers are matched using their fully qualified name (`parent.child`).

Given: `{ ignore: ["utilities", /^vendor/] }`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@layer base;
@layer utilities { a { color: red; } }
@layer vendor-theme { b { color: red; } }
```

## Prior art

- [`no-unknown-container-names`](../no-unknown-container-names/README.md) — same concept applied to container names
- [`no-unused-layers`](../no-unused-layers/README.md) — the inverse: layers that are declared but never used
