# no-duplicate-custom-idents

Disallow duplicate user-defined custom identifiers.

<!-- prettier-ignore -->
```css
@keyframes test {}
@keyframes test {}
/*          ↑
 * This duplicate name */
```

Defining the same custom identifier more than once in a stylesheet is almost always a mistake. When a name is defined twice, the second definition silently shadows the first, causing unexpected behavior or making one of the definitions dead code. This rule flags duplicate names across four namespaces independently: `@keyframes` animation names, `@property` custom property registrations, `container-name` / `container` shorthand names, and `anchor-name` values. CSS-wide keywords (`initial`, `inherit`, `unset`, `revert`, `revert-layer`) and common reserved values (`none`, `auto`) are ignored since they are not valid custom identifiers.

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
@property --brand-color { syntax: "<color>"; inherits: false; initial-value: red; }
@property --brand-color { syntax: "<color>"; inherits: false; initial-value: blue; }
```

<!-- prettier-ignore -->
```css
.sidebar { container-name: sidebar; }
.also-sidebar { container-name: sidebar; }
```

<!-- prettier-ignore -->
```css
.a { anchor-name: --tooltip; }
.b { anchor-name: --tooltip; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@keyframes slide-in {}
@keyframes slide-out {}
```

<!-- prettier-ignore -->
```css
/* The same name used as a keyframe and as a container name is fine —
   these are separate namespaces. */
@keyframes main {}
.layout { container-name: main; }
```

<!-- prettier-ignore -->
```css
/* CSS-wide keywords are not valid custom identifiers and are ignored. */
@keyframes none {}
@keyframes none {}
```
