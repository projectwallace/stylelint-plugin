# Min declaration uniqueness ratio

Enforce a minimum ratio of unique declarations across the stylesheet.

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: red; }
/*  ↑
*   Repeated property-value pairs reduce the uniqueness ratio */
```

This rule calculates the **ratio of unique `property: value` pairs** out of all declarations in the stylesheet. A low ratio indicates that many declarations are repeated, which may signal redundant or poorly structured CSS. Unlike stylelint's built-in `declaration-block-no-duplicate-properties`, this rule catches file-wide repetition by ratio rather than duplicates within a single block.

Declarations inside at-rules (e.g. `@media`) and nested rules are all counted.

## Options

`Number`

The option must be between `0` and `1`, where `1` means every declaration must be unique and `0` effectively disables the rule.

Given:

`0.5`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: red; }
c { color: red; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1em; }
b { color: blue; margin: 0; }
```

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1em; }
b { color: red; margin: 0; }
```
