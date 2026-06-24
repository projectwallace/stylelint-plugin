# No unused layers

Disallow `@layer` names that are declared but never used.

<!-- prettier-ignore -->
```css
@layer reset, utilities;
/*            ↑
*   "utilities" is declared here but never used */

@layer reset {
	* { margin: 0; }
}
```

A layer name is considered _declared_ when it appears in a `@layer` statement (e.g. `@layer reset, utilities;` or `@layer utilities;`). It is considered _used_ when it has a corresponding block (e.g. `@layer utilities { ... }`) or is loaded via `@import` with a `layer()` function (e.g. `@import url('utilities.css') layer(utilities)`). This rule reports layer names that are declared but never used in the same stylesheet.

### Sublayers and parent layers

Declaring a sublayer does **not** count as usage of the parent layer. The following still flags both `core` and `core.reset` as unused:

<!-- prettier-ignore -->
```css
@layer core;
@layer core.reset, core.tokens;
```

However, _using_ a sublayer — either via a block rule or `@import layer()` — **does** count as usage of all ancestor layers:

<!-- prettier-ignore -->
```css
/* @layer core.reset { } marks both core.reset and core as used */
@layer core;
@layer core.reset { * { margin: 0; } }
```

<!-- prettier-ignore -->
```css
/* @import layer(core.reset) marks both core.reset and core as used */
@layer core, core.reset;
@import url('reset.css') layer(core.reset);
```

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
@layer reset, utilities;
@layer reset { * { margin: 0; } }
```

<!-- prettier-ignore -->
```css
@layer utilities;
```

<!-- prettier-ignore -->
```css
/* Declaring a sublayer does not count as usage of the parent */
@layer core;
@layer core.reset, core.tokens;
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@layer reset, utilities;
@layer reset { * { margin: 0; } }
@layer utilities { .u-flex { display: flex; } }
```

<!-- prettier-ignore -->
```css
@layer reset { * { margin: 0; } }
```

<!-- prettier-ignore -->
```css
/* Using a sublayer block marks the parent as well as the sublayer itself as used */
@layer core;
@layer core.reset { * { margin: 0; } }
```

<!-- prettier-ignore -->
```css
/* @import layer() marks both the layer and its ancestors as used */
@layer core, core.reset;
@import url('reset.css') layer(core.reset);
```

## Optional secondary options

### `ignore: Array<string | RegExp>`

Ignore specific layer names that are declared but not used. This is useful for layers that are intentionally defined in external stylesheets (e.g. third-party resets).

Strings wrapped in `/` delimiters (e.g. `"/^--brand/"`, `"/^--brand/i"`) are treated as regular expressions, allowing regex patterns in JSON config files.

Given:

```js
;['vendor-reset']
```

The following are considered problems:

<!-- prettier-ignore -->
```css
@layer vendor-reset, utilities;
@layer vendor-reset { * { margin: 0; } }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@layer vendor-reset, utilities;
@layer utilities { .u-flex { display: flex; } }
```

## Prior art

- ESLint's [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars) rule — same concept applied to CSS
