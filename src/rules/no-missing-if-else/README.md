# No missing if() else

Require every `if()` function to include an `else` condition.

<!-- prettier-ignore -->
```css
a {
  color: if(
    style(--dark): white;
    style(--light): black
/*  ^^^^^^^^^^^^^^^^^^^^^ */
  );
}
```

The `if()` function evaluates its conditions in order and uses the value of the first one that matches. Without an `else` branch, none of the conditions may match, in which case the property is treated as if `if()` had returned the [guaranteed-invalid value](https://www.w3.org/TR/css-values-4/#guaranteed-invalid) — silently dropping the declaration. Adding an `else` branch guarantees a fallback value is always available.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
a {
  color: if(
    style(--dark): white;
    style(--light): black
  );
}

a {
  width: if(
    media(width > 600px): 50%
  );
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a {
  color: if(
    style(--dark): white;
    else: black
  );
}

a {
  width: if(
    media(width > 600px): 50%;
    else: 100%
  );
}
```

## Prior art

- [CSS Values and Units Module Level 5: the `if()` function](https://drafts.csswg.org/css-values-5/#if-notation)
