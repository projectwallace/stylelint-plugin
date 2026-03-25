# Max declarations per rule

Limit the number of declarations in a single rule.

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1rem; /* ... 14+ more declarations */ }
/*  ↑
*   these declarations on a single rule may be flagged */
```

## Options

`Number`

Given:

`15`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1rem; font-weight: bold; line-height: 1.5; letter-spacing: 0; text-align: left; text-decoration: none; display: block; margin: 0; padding: 0; border: 0; background: none; outline: none; cursor: pointer; opacity: 1; visibility: visible; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; font-size: 1rem; }
```

<!-- prettier-ignore -->
```css
a { color: red; }
```
