# no-duplicate-keyframes

Disallow duplicate `@keyframes` names.

<!-- prettier-ignore -->
```css
@keyframes slide-in {}
@keyframes slide-in {}
/*          ↑
 * This duplicate name */
```

Defining the same `@keyframes` name more than once is almost always a mistake. The second definition silently overrides the first, making one of them dead code. CSS-wide keywords (`initial`, `inherit`, `unset`, `revert`, `revert-layer`) and reserved values (`none`, `auto`) are ignored since they are not valid `<custom-ident>` values.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@keyframes slide-in {}
@keyframes slide-in {}
```

<!-- prettier-ignore -->
```css
@keyframes foo {}
@keyframes foo {}
@keyframes foo {}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@keyframes slide-in {}
@keyframes slide-out {}
```

<!-- prettier-ignore -->
```css
/* CSS-wide keywords are not valid custom identifiers and are ignored. */
@keyframes none {}
@keyframes none {}
```
