# Contributing

## Project structure

- All lint rules live in `src/rules`
- Each rule is self-contained: `index.ts` for rule source, `index.test.ts` for tests and `README.md` for the rule documentation
- Rule presets live in `src/configs`

## Developing

- Before committing, run the linter: `npm run lint`
- This project uses ESM only, do not use CommonJS

## Adding a new rule

1. Create a new folder under `src/rules/<rule-name>/` with **all three** of the following files (none are optional):
   - `index.ts` — the rule implementation
   - `index.test.ts` — tests for the rule
   - `README.md` — documentation (see [Rule README guidelines](#rule-readme-guidelines))
2. Register the rule in `src/index.ts` (import + plugins array) at the correct alphabetical position and update `src/index.test.ts` (expected names array) accordingly
3. Add the rule to **all applicable** configuration presets in `src/configs/` — the `src/configs/recommended.test.ts` asserts that every exported rule appears in `recommended.ts`, so omitting it will fail the test suite
4. Add the rule to the corresponding preset configuration rules list in root `README.md`
5. Use PostCSS API's as much as possible. Only if goals cannot be achieved reach for `@projectwallace/css-parser`
6. Only use `@projectwallace/css-parser` methods `parse_value()`, `parse_selector()`, or `parse_atrule_prelude()`. Other parsing methods SHOULD NOT be necessary.
7. If the rule should allow users to exclude specific values, add a secondary `ignore` option (see [the `ignore` option pattern](#the-ignore-option-pattern) below).

## Rule README guidelines

Every rule's `README.md` must follow this structure exactly:

````md
# Rule name

One-sentence description.

<!-- prettier-ignore -->
```css
selector or declaration {}
/*  ↑
*   what this arrow points at */
````

One paragraph explaining what is measured and why it matters.

## Options

`type signature`

Description of each component (e.g. for [a, b, c] tuples: what a, b, c mean).

Given: `<example option value>`

the following are considered violations:

<!-- prettier-ignore -->
```css
/* violating CSS */
```

The following patterns are _not_ considered violations:

<!-- prettier-ignore -->
```css
/* passing CSS */
```

````

Rules:
- Wrap all CSS blocks with `<!-- prettier-ignore -->` to prevent reformatting
- Show at least one violation and one passing pattern
- Document all options including their type signature

## The `ignore` option pattern

When a rule should let users exclude specific values from being checked, name the secondary option `ignore`. It accepts `Array<string | RegExp>`. Both exact string matches and regular expressions must be supported.

**Naming:** always `ignore`, never `allowList`, `ignoreValues`, `ignoreProperties`, or any other variant.

**Validation** — import `ignore_option_validators` from `src/utils/option-validators.ts` and pass it to `validateOptions`:

```ts
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'

// inside validateOptions:
{
  actual: secondaryOptions,
  possible: { ignore: ignore_option_validators },
  optional: true,
}
````

**Checking** — import `is_allowed` from the same utility and call it with the value and the option:

```ts
const ignore = secondaryOptions?.ignore ?? []
if (!is_allowed(value, ignore)) {
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

**Assertions** — always check both `errored` and `warnings` together. Use `toStrictEqual([])` for empty warnings. Exception: invalid-option tests (the `should not run when …` group) only assert `expect(errored).toBe(true)` — no `warnings` check, since the count and content of validation errors are stylelint internals.

**`ignore` option tests** — whenever a rule supports the `ignore` secondary option, cover both a plain string match and a `RegExp` pattern in the tests.

**`test.each`** — use `test.each([])` instead of individual `test()` calls when testing multiple similar inputs (e.g. a list of CSS keywords or property values). This keeps test files concise.

## Rule option patterns

### Single integer option

Import the appropriate validator from `src/utils/option-validators.ts` and pass it directly to `possible`. No secondary guard is needed.

| Validator                       | Accepts      | Use for                           |
| ------------------------------- | ------------ | --------------------------------- |
| `is_valid_positive_integer`     | integer > 0  | counts that must be at least 1    |
| `is_valid_non_negative_integer` | integer >= 0 | counts that may be 0 (to disable) |
| `is_valid_ratio`                | float 0–1    | percentage/ratio options          |

```ts
import { is_valid_positive_integer } from '../../utils/option-validators.js'

// inside validateOptions:
{ actual: primaryOption, possible: [is_valid_positive_integer] }
```

Passing an out-of-range value (e.g. `-1` or `1.5` to a count rule) is a **breaking error** — stylelint reports `errored: true` rather than silently skipping the rule.

### Array (tuple) option — e.g. `[a, b, c]` specificity

Set `ruleFunction.primaryOptionArray = true` so stylelint treats the array as the primary option rather than a secondary-option wrapper. Validate with a custom function:

```ts
function is_valid_specificity(v: unknown): boolean {
	return (
		Array.isArray(v) &&
		v.length === 3 &&
		v.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0)
	)
}
```

Use `possible: is_valid_specificity` inside `validateOptions`.

### Comparing CSS specificity

```ts
import { getSpecificity, compareSpecificity } from '@projectwallace/css-analyzer/selectors'

// compareSpecificity returns > 0 when first arg has higher specificity than second
if (compareSpecificity(actual, max) > 0) {
	// violation
}
```

For per-selector checks, parse first then call `getSpecificity` on each individual selector text:

```ts
import { parse_selector } from '@projectwallace/css-parser/parse-selector'

const selector_list = parse_selector(rule.selector)
for (const selector of selector_list.children) {
	const specificities = getSpecificity(selector.text)
	const specificity = specificities[0] as [number, number, number]
	// compare specificity here
}
```

## Adding a new config

1. Create a new file under `src/configs/<config-name>.ts`
2. Document the config in the **Usage** section of `README.md`
