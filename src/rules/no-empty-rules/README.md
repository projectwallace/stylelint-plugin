# No empty rules

Disallow empty rules and at-rules (including those containing only comments).

<!-- prettier-ignore -->
```css
a {
/* ^ */
}
```

Empty rules add noise to stylesheets without affecting styling. Rules that contain only comments provide no declarations and should be removed or filled with actual styles.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
a {}
```

<!-- prettier-ignore -->
```css
a { /* comment */ }
```

<!-- prettier-ignore -->
```css
@media screen {}
```

<!-- prettier-ignore -->
```css
@media screen { /* comment */ }
```

<!-- prettier-ignore -->
```css
a { &:hover {} }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a { color: red; }
```

<!-- prettier-ignore -->
```css
@media screen { a { color: red; } }
```

<!-- prettier-ignore -->
```css
a { &:hover { color: red; } }
```

<!-- prettier-ignore -->
```css
@charset "UTF-8";
```

## Secondary options

### `allow: Array<"rules" | "atrules" | "comments">`

#### `"rules"`

Allow empty regular CSS rules (selector blocks).

The following is _not_ considered a problem:

<!-- prettier-ignore -->
```css
/* "rules" */
a {}
```

#### `"atrules"`

Allow empty at-rules (at-rule blocks with no content).

The following is _not_ considered a problem:

<!-- prettier-ignore -->
```css
/* "atrules" */
@media screen {}
```

#### `"comments"`

Allow rules and at-rules whose only content is comments.

The following are _not_ considered problems:

<!-- prettier-ignore -->
```css
/* "comments" */
a { /* comment */ }
```

<!-- prettier-ignore -->
```css
/* "comments" */
@media screen { /* comment */ }
```
