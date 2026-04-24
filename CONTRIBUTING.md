# Contributing

## Developing

Before committing, run the linter:

```sh
npm run lint
```

## Adding a new rule

1. Create a new folder under `src/rules/<rule-name>/` with the following files:
   - `index.ts` — the rule implementation
   - `index.test.ts` — tests for the rule
   - `README.md` — documentation (see [Rule README guidelines](#rule-readme-guidelines))
2. Register the rule in `src/index.ts`
3. Add the rule to the **Manual configuration** example and the **Rules** table in `README.md`
4. Consider adding the rule to one or more of the configuration presets in `src/configs/`
5. Use PostCSS API's as much as possible. Only if goals cannot be achieved reach for `@projectwallace/css-parser`
6. Only use `@projectwallace/css-parser` methods `parse_value()`, `parse_selector()`, or `parse_atrule_prelude()`. Other parsing methods SHOULD NOT be necessary.
7. If the rule should allow users to exclude specific values, add a secondary `ignore` option (see [the `ignore` option pattern](#the-ignore-option-pattern) below).

## Rule README guidelines

Every rule's `README.md` must:

- Show at least one example of a **violation** and one **passing** pattern
- Document all available options

## The `ignore` option pattern

When a rule should let users exclude specific values from being checked, name the secondary option `ignore`. It accepts `Array<string | RegExp>`. Both exact string matches and regular expressions must be supported.

**Naming:** always `ignore`, never `allowList`, `ignoreValues`, `ignoreProperties`, or any other variant.

**Validation** — import `ignoreOptionValidators` from `src/utils/allow-list.ts` and pass it to `validateOptions`:

```ts
import { isAllowed, ignoreOptionValidators } from '../../utils/allow-list.js'

// inside validateOptions:
{
  actual: secondaryOptions,
  possible: { ignore: ignoreOptionValidators },
  optional: true,
}
```

**Checking** — import `isAllowed` from the same utility and call it with the value and the option:

```ts
const ignore = secondaryOptions?.ignore ?? []
if (!isAllowed(value, ignore)) {
	/* count or report */
}
```

## Adding a new config

1. Create a new file under `src/configs/<config-name>.ts`
2. Document the config in the **Usage** section of `README.md`
