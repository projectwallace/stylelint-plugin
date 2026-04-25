# Contributing

## Developing

- Before committing, run the linter: `npm run lint`
- This project uses ESM only, do not use CommonJS

## Adding a new rule

1. Create a new folder under `src/rules/<rule-name>/` with the following files:
   - `index.ts` — the rule implementation
   - `index.test.ts` — tests for the rule
   - `README.md` — documentation (see [Rule README guidelines](#rule-readme-guidelines))
2. Register the rule in `src/index.ts` and update `/src/index.test.ts` accordingly
3. Consider adding the rule to one or more of the configuration presets in `src/configs/`
4. Add the rule to the corresponding preset configuration rules list in `README.md`
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

## Testing conventions

**`lint()` helper** — rules with a primary option use a shared async helper so each test only passes the CSS and options:

```ts
async function lint(code: string, primaryOption: unknown, secondaryOptions?: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]:
				secondaryOptions !== undefined ? [primaryOption, secondaryOptions] : primaryOption,
		},
	}
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}
```

**Section headers** — group tests with 75-dash divider comments:

```ts
// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------
```

**Test naming** — use the following prefixes consistently:

- `should not run when …` — for invalid/disabled config (option validation)
- `should not error when …` — for valid CSS that passes the rule
- `should error when …` — for CSS that triggers a violation

**Assertions** — always check both `errored` and `warnings` together. Use `toStrictEqual([])` for empty warnings.

**`ignore` option tests** — whenever a rule supports the `ignore` secondary option, cover both a plain string match and a `RegExp` pattern in the tests.

**`test.each`** — use `test.each([])` instead of individual `test()` calls when testing multiple similar inputs (e.g. a list of CSS keywords or property values). This keeps test files concise.

## Adding a new config

1. Create a new file under `src/configs/<config-name>.ts`
2. Document the config in the **Usage** section of `README.md`
