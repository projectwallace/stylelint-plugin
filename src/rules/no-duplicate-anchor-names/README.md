# no-duplicate-anchor-names

Disallow duplicate `anchor-name` values.

<!-- prettier-ignore -->
```css
.a { anchor-name: --tooltip; }
.b { anchor-name: --tooltip; }
/*                ↑
 * This duplicate name */
```

Each anchor name should be assigned to exactly one element. Assigning the same `anchor-name` to multiple elements is almost always a mistake — only one of the elements can serve as the anchor target, making the duplicate definition dead code. Comma-separated lists of anchor names are each checked individually. The reserved value `none` and CSS-wide keywords are ignored.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
.a { anchor-name: --tooltip; }
.b { anchor-name: --tooltip; }
```

<!-- prettier-ignore -->
```css
/* A name already defined elsewhere appearing in a comma-separated list */
.a { anchor-name: --foo; }
.b { anchor-name: --bar, --foo; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.a { anchor-name: --foo; }
.b { anchor-name: --bar; }
```

<!-- prettier-ignore -->
```css
/* none is a reserved value and is ignored */
.a { anchor-name: none; }
.b { anchor-name: none; }
```
