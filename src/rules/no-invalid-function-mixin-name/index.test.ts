import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-invalid-function-mixin-name'

async function lint(code: string, primaryOption: unknown = true, secondaryOptions?: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]:
				secondaryOptions === undefined ? primaryOption : [primaryOption, secondaryOptions],
		},
	}
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test(`should not error when function and mixin names start with \`--\``, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { result: 1; } @mixin --m() {} .a { @apply --m; }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin has no parameter list`, async () => {
	const { warnings, errored } = await lint(`@mixin --m { color: red; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function name does not start with \`--\``, async () => {
	const { warnings, errored } = await lint(`@function f(--a) { result: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected name "f" for @function, names must start with "--" (${rule_name})`,
	])
})

test(`should error when a mixin name does not start with \`--\``, async () => {
	const { warnings, errored } = await lint(`@mixin m { color: red; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected name "m" for @mixin, names must start with "--" (${rule_name})`,
	])
})

test(`should error when an @apply name does not start with \`--\``, async () => {
	const { warnings, errored } = await lint(`.a { @apply m; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected name "m" for @apply, names must start with "--" (${rule_name})`,
	])
})
