# Min selector uniqueness ratio

Enforce a minimum ratio of unique selectors across the stylesheet.

<!-- prettier-ignore -->
```css
a { color: red; }
a { color: blue; }
/*↑
* Repeated selectors reduce the uniqueness ratio */
```

This rule calculates the **ratio of unique selectors** out of all selectors in the stylesheet. A low ratio indicates systemic repetition that may point to poorly structured CSS. Unlike stylelint's built-in `no-duplicate-selectors`, this rule flags file-wide repetition by ratio rather than exact duplicates within a block.

Selectors inside at-rules (e.g. `@media`) and nested rules are all counted.

## Options

`Number`

The option must be between `0` and `1`, where `1` means every selector must be unique and `0` effectively disables the rule.

Given:

`0.66`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
a { color: blue; }
a { color: green; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
c { color: green; }
```

<!-- prettier-ignore -->
```css
a { color: red; }
a { color: blue; }
b { color: green; }
```
