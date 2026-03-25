# No invalid z-index

Disallow `z-index` values that are not valid 32-bit integers.

<!-- prettier-ignore -->
```css
a {
  z-index: 2147483648;
/*         ^^^^^^^^^^ */
}
```

A valid `z-index` must be a whole number (integer) within the 32-bit signed integer range: `-2147483648` to `2147483647`. Values outside this range or non-integer values (such as floats) are invalid.

This rule also checks fallback values inside `var()`.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
/* Out of range (exceeds int32 max) */
a { z-index: 2147483648; }

/* Out of range (below int32 min) */
a { z-index: -2147483649; }

/* Non-integer value */
a { z-index: 1.5; }

/* Invalid fallback value inside var() */
a { z-index: var(--my-z, 2147483648); }
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
/* Valid integer */
a { z-index: 100; }

/* Valid negative integer */
a { z-index: -1; }

/* auto is valid */
a { z-index: auto; }

/* Maximum valid value */
a { z-index: 2147483647; }

/* Minimum valid value */
a { z-index: -2147483648; }

/* var() without fallback (value cannot be checked) */
a { z-index: var(--my-z); }

/* var() with valid fallback */
a { z-index: var(--my-z, 100); }
```
