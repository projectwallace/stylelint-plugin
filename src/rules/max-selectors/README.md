# Max selectors

Limit the total number of selectors in a stylesheet.

<!-- prettier-ignore -->
```css
a, b { color: red; }
/*↑ ↑
*  each selector counts towards the total */
```

This rule counts every individual selector across all rules, including each selector in a comma-separated list. Limiting the total number of selectors is a measure of how many distinct elements a stylesheet targets.

Where per-rule limits catch individual complexity, this catches cumulative scale: a stylesheet can pass every granular check and still have grown too large to reason about as a whole.

## Options

`Number`

Given:

`1`

the following are considered violations:

<!-- prettier-ignore -->
```css
a, b { color: red; }
```

<!-- prettier-ignore -->
```css
a { color: red; }
b { color: blue; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { color: red; }
```
