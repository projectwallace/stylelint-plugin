# no-invalid-property-registration

Disallow `@property` registrations that browsers will silently ignore.

<!-- prettier-ignore -->
```css
@property --size { syntax: "<length>"; inherits: false; initial-value: 10; }
/*                                                      ↑
*                                                       not a <length> */
```

When an `@property` rule is invalid, the browser drops the entire registration without any warning. The custom property then silently behaves like an unregistered one: it is not typed, cannot be animated and has no initial value. This rule catches the registrations that would be dropped:

- the name does not start with `--`
- the `syntax` descriptor is missing or is not a quoted string
- the `inherits` descriptor is missing or is not `true` or `false`
- the `initial-value` descriptor is missing, unless `syntax` is `"*"`
- the `initial-value` depends on other values, such as `var()`
- the `initial-value` does not match a single basic `syntax` type such as `<length>`, `<number>`, `<integer>`, `<percentage>`, `<length-percentage>`, `<angle>`, `<time>`, `<resolution>`, `<flex>` or `<color>`

Initial values are only checked against syntaxes that consist of one of the types above. Unions (`<length> | auto`), multipliers (`<length>+`) and values containing functions (`calc()`) are not validated, to avoid false positives.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@property --size { syntax: "<length>"; inherits: false; }
```

<!-- prettier-ignore -->
```css
@property --size { syntax: "<length>"; initial-value: 0px; }
```

<!-- prettier-ignore -->
```css
@property --size { syntax: "<length>"; inherits: false; initial-value: 10; }
```

<!-- prettier-ignore -->
```css
@property --size { syntax: <length>; inherits: false; initial-value: 0px; }
```

<!-- prettier-ignore -->
```css
@property --size { syntax: "<length>"; inherits: false; initial-value: var(--base); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@property --size { syntax: "<length>"; inherits: false; initial-value: 0px; }
```

<!-- prettier-ignore -->
```css
@property --anything { syntax: "*"; inherits: true; }
```

<!-- prettier-ignore -->
```css
@property --size { syntax: "<length> | auto"; inherits: false; initial-value: auto; }
```

## Prior art

- [`no-duplicate-registered-properties`](../no-duplicate-registered-properties/README.md)
- [CSS Properties and Values API, `@property` rule](https://drafts.css-houdini.org/css-properties-values-api/#at-property-rule)
