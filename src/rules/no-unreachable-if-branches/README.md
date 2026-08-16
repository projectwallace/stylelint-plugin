# No unreachable if() branches

Require the `else` branch of an `if()` function to always be the last branch.

<!-- prettier-ignore -->
```css
a {
  color: if(
    else: black;
/*  ^^^^^^^^^^^ */
    style(--dark): white
  );
}
```

`if()` evaluates its branches in source order and returns the value of the first one whose condition matches. Since `else` always matches, any branch that comes after it can never be reached — it's dead code, and usually a sign that the branches were meant to be in a different order, or a leftover from debugging.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
a {
  color: if(
    else: black;
    style(--dark): white
  );
}

a {
  /* the first "else" is not last, so it is flagged */
  color: if(
    style(--dark): white;
    else: black;
    else: red
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
  color: if(
    style(--dark): white;
    style(--light): black;
    else: gray
  );
}

a {
  /* if() without an else is not this rule's concern */
  color: if(
    style(--dark): white;
    style(--light): black
  );
}
```
