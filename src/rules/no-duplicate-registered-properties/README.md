# no-duplicate-registered-properties

Disallow duplicate `@property` registrations.

<!-- prettier-ignore -->
```css
@property --brand-color { syntax: "<color>"; inherits: false; initial-value: red; }
@property --brand-color { syntax: "<color>"; inherits: false; initial-value: blue; }
/*         ↑
 * This duplicate registration */
```

Registering the same custom property name more than once with `@property` is almost always a mistake. The second registration silently overrides the first, leaving one of them dead code and making it unclear which syntax or initial value applies.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@property --color { syntax: "<color>"; inherits: false; initial-value: red; }
@property --color { syntax: "<color>"; inherits: false; initial-value: blue; }
```

<!-- prettier-ignore -->
```css
@property --spacing { syntax: "<length>"; inherits: true; initial-value: 0px; }
@property --spacing { syntax: "<length>"; inherits: true; initial-value: 8px; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@property --color { syntax: "<color>"; inherits: false; initial-value: red; }
@property --spacing { syntax: "<length>"; inherits: true; initial-value: 0px; }
```
