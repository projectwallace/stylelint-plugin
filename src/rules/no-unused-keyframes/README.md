# no-unused-keyframes

Disallow `@keyframes` that are never referenced in an `animation-name` or `animation` declaration.

<!-- prettier-ignore -->
```css
@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
/*         ↑
*          this name */
```

Declaring `@keyframes` that are never used adds dead code that increases file size and can cause confusion. This rule reports any `@keyframes` name that does not appear in an `animation-name` property or the name position of an `animation` shorthand.

## Options

`true`

The following patterns are considered violations:

<!-- prettier-ignore -->
```css
@keyframes slide-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

<!-- prettier-ignore -->
```css
@keyframes slide-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

a { animation: 1s ease; }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@keyframes slide-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

a { animation-name: slide-in; }
```

<!-- prettier-ignore -->
```css
@keyframes slide-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

a { animation: slide-in 1s ease forwards; }
```

### Secondary options

`{ ignore: ["/regex/", "non-regex"] }`

Ignore specific keyframe names by exact string or regular expression.

Given: `{ ignore: ["slide-in", /^fade/] }`

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
```

## Prior art

- ESLint's [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars) rule — same concept applied to CSS
