# No value browserhacks

Disallow the use of known browser hacks in values.

<!-- prettier-ignore -->
```css
.selector { property: value\9; }
/*                         ↑
*                          Value browserhack not allowed */
```

Value-level browserhacks like `\9` target old IE versions and add dead weight to stylesheets. This rule complements `no-property-browserhacks` by catching hacks that appear in the value rather than the property name.

## Options

`true`

The following are considered violations:

<!-- prettier-ignore -->
```css
.box {
	background: red\9;
}
```

<!-- prettier-ignore -->
```css
.box {
	color: blue\9;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.box {
	background: red;
}
```

<!-- prettier-ignore -->
```css
.box {
	color: blue;
}
```
