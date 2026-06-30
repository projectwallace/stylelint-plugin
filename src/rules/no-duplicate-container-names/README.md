# no-duplicate-container-names

Disallow duplicate container names.

<!-- prettier-ignore -->
```css
.a { container-name: sidebar; }
.b { container-name: sidebar; }
/*                   ↑
 * This duplicate name */
```

Defining the same container name on more than one element is almost always a mistake. A duplicate makes `@container sidebar` queries ambiguous and the second definition shadows the first in the containment tree. Both the `container-name` property and the `container` shorthand are checked. The reserved value `none` and CSS-wide keywords are ignored.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
.sidebar { container-name: sidebar; }
.also-sidebar { container-name: sidebar; }
```

<!-- prettier-ignore -->
```css
.a { container: main / inline-size; }
.b { container: main / block-size; }
```

<!-- prettier-ignore -->
```css
/* container-name and the container shorthand share the same namespace */
.a { container-name: main; }
.b { container: main / inline-size; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.sidebar { container-name: sidebar; }
.header { container-name: header; }
```

<!-- prettier-ignore -->
```css
/* The type after `/` is not a name and is never checked */
.a { container: sidebar / inline-size; }
.b { container: header / inline-size; }
```

<!-- prettier-ignore -->
```css
/* none is a reserved value and is ignored */
.a { container-name: none; }
.b { container-name: none; }
```
