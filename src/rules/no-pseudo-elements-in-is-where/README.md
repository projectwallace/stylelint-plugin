# No pseudo-elements in `:is()` and `:where()`

Disallow pseudo-elements inside `:is()` and `:where()` selectors.

<!-- prettier-ignore -->
```css
:is(::before, ::after) { content: "" }
/*   ↑
*    Pseudo-elements are not valid inside :is() or :where() */
```

Pseudo-elements like `::before` and `::after` are not valid in `:is()` or `:where()`. According to the CSS spec, these functions only accept a [forgiving selector list](https://www.w3.org/TR/selectors-4/#typedef-forgiving-selector-list), which does not include pseudo-elements. While browsers may silently ignore invalid entries in `:is()` due to its forgiving nature, this means the rule will have no effect — which is likely not what was intended.

## Options

`true`

The following are considered violations:

<!-- prettier-ignore -->
```css
:is(::before, ::after) {
	content: "";
}
```

<!-- prettier-ignore -->
```css
:where(::placeholder) {
	color: grey;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
:is(a, button) {
	color: red;
}
```

<!-- prettier-ignore -->
```css
:where(:hover, :focus) {
	outline: none;
}
```

<!-- prettier-ignore -->
```css
a::before {
	content: "";
}
```

## Prior art

- [CSS Selectors 4 spec](https://www.w3.org/TR/selectors-4/#typedef-forgiving-selector-list) — forgiving selector lists exclude pseudo-elements
