# No useless if()

Disallow `if()` functions whose only branch is `else`.

<!-- prettier-ignore -->
```css
a {
  color: if(
    else: black
/*  ^^^^^^^^^^^ */
  );
}
```

An `if()` with no condition branches always evaluates to the value of its `else` branch — it can never be anything else. Writing the value directly is equivalent and doesn't carry the runtime cost or the false impression that the declaration is conditional.

## Options

### `true`

The following are considered problems:

<!-- prettier-ignore -->
```css
a {
  color: if(
    else: black
  );
}

a {
  width: if(
    else: 100%
  );
}
```

The following patterns are _not_ considered problems:

<!-- prettier-ignore -->
```css
a {
  color: black;
}

a {
  color: if(
    style(--dark): white;
    else: black
  );
}

a {
  /* no else at all is not this rule's concern */
  color: if(
    style(--dark): white
  );
}
```
