# no-duplicate-custom-properties

Disallow duplicate custom property declarations.

<!-- prettier-ignore -->
```css
:root { --color: red; }
.a    { --color: blue; }
/*      ↑
 * This duplicate declaration */
```

Declaring the same custom property more than once anywhere in a stylesheet is almost always a mistake. The later declaration shadows the earlier one, making it dead code. This rule flags every declaration after the first, regardless of which selector it appears in.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
:root { --color: red; }
.a    { --color: blue; }
```

<!-- prettier-ignore -->
```css
:root {
  --color: red;
  --color: blue;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
/* Each custom property name appears only once. */
:root {
  --color: red;
  --size: 1rem;
}
```
