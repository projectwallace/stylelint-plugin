# No unused layers

Disallow `@layer` names that are declared but never defined.

<!-- prettier-ignore -->
```css
@layer reset, utilities;
/*            ↑
*   "utilities" is declared here but never defined with a block */

@layer reset {
	* { margin: 0; }
}
```

A layer name is considered _declared_ when it appears in a `@layer` statement (e.g. `@layer reset, utilities;` or `@layer utilities;`). It is considered _defined_ when it has a corresponding block (e.g. `@layer utilities { ... }`). This rule reports layer names that are declared but never defined in the same stylesheet.

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

## Optional secondary options

### `ignore: [/regex/, "non-regex"]`

Ignore specific layer names that are declared but not defined. This is useful for layers that are intentionally defined in external stylesheets (e.g. third-party resets).

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
