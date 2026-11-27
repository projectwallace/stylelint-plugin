import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-apply-too-many-arguments'

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

test(`should not error when fewer arguments than parameters are passed`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a, --b) {} .a { @apply --m(1px); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when as many arguments as parameters are passed`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a, --b) {} .a { @apply --m(1px, 2px); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin is applied without arguments`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) {} .a { @apply --m; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when the mixin is not defined`, async () => {
	const { warnings, errored } = await lint(`.a { @apply --m(1px, 2px); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a nested function contains commas`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) {} .a { @apply --m(rgb(1, 2, 3)); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when too many arguments are passed`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) {} .a { @apply --m(1px, 2px); }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected 2 arguments for mixin "--m", it only has 1 parameters (${rule_name})`,
	])
})

test(`should error when arguments are passed to a mixin without parameters`, async () => {
	const { warnings, errored } = await lint(`@mixin --m {} .a { @apply --m(1px) { color: red } }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected 1 arguments for mixin "--m", it only has 0 parameters (${rule_name})`,
	])
})
