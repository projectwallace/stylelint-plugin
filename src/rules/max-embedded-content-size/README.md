# Max embedded content size

Prevent the total size of embedded content from exceeding a predefined number of bytes.

<!-- prettier-ignore -->
```css
a { background: url("data:image/png;base64,ABC123"); }
/*                   ↑
*   data: URLs count towards the total embedded content size */
```

This rule counts the **total byte size** of all embedded content referenced via `data:` URLs in the stylesheet. Embedding large images or fonts directly in CSS can significantly increase file size.

## Options

`Number`

Given:

`10`

the following are considered violations:

<!-- prettier-ignore -->
```css
a { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA"); }
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
a { background: url("image.png"); }
```

<!-- prettier-ignore -->
```css
a { color: red; }
```
