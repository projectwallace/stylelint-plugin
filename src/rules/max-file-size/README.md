# Max file size

Prevent a stylesheet from exceeding a predefined file size in bytes.

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
/*               ↑
*   every byte in the stylesheet counts towards the total */
```

This rule counts the **total byte size** of the entire stylesheet, including all rules, declarations, comments, and whitespace.

## Options

`Number`

Given:

`30`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a { color: red; }
```

<!-- prettier-ignore -->
```css
a {}
```

## Prior art

- ESLint's [`max-lines`](https://eslint.org/docs/latest/rules/max-lines) rule — same concept applied to JavaScript files
