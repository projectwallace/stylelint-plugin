# No important in keyframes

Disallow `!important` declarations inside `@keyframes` blocks.

<!-- prettier-ignore -->
```css
@keyframes fade {
  from { opacity: 0 !important; }
/*                  ↑
*   this !important */
}
```

Using `!important` inside `@keyframes` has no effect on animations — browsers ignore it. Its presence almost always indicates a copy-paste error or a misunderstanding of how CSS animations work.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
@keyframes fade {
  from { opacity: 0 !important; }
  to { opacity: 1; }
}
```

<!-- prettier-ignore -->
```css
@keyframes slide {
  0% { transform: translateX(0) !important; }
  100% { transform: translateX(100px) !important; }
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

<!-- prettier-ignore -->
```css
/* !important outside @keyframes is unaffected */
a { color: red !important; }
```
