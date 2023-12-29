# No Property browserhacks

Prevent the use of [known browserhacks](http://browserhacks.com/) for properties, ususally properties starting with characters like `+`, `*`, etc.

<!-- prettier-ignore -->
```css
.selector { _property: value; }
.selector { -property: value; }
/*          ↑
*           Browserhack prefix not allowed */
```

The following are considered violations:

<!-- prettier-ignore -->
```css
.selector {
	*zoom: 1;
}
```

<!-- prettier-ignore -->
```css
.selector {
	+property: value;
}
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
.selector {
	property: value;
}
```
