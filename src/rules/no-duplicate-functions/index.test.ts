import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-functions'

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

test(`should not error when function names are unique`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { result: 1; }@function --f2() { result: 1; }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when the same function name is defined in different layers`, async () => {
	const { warnings, errored } = await lint(
		`@layer a { @function --f() { result: 1; } } @layer b { @function --f() { result: 1; } }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when the same function name is defined twice`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { result: 1; }@function --f() { result: 1; }`,
	)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected duplicate @function "--f" (${rule_name})`,
	])
})

test(`should error when the same function name is defined three times`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { result: 1; }@function --f() { result: 1; }@function --f() { result: 1; }`,
	)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected duplicate @function "--f" (${rule_name})`,
		`Unexpected duplicate @function "--f" (${rule_name})`,
	])
})
