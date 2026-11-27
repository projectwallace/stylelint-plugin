import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/require-function-result'

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

test(`should not error when a function has a result`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: 1px; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when the result is in a conditional rule`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { @media (width > 40em) { result: 1px; } }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when the result descriptor is uppercase`, async () => {
	const { warnings, errored } = await lint(`@function --f() { RESULT: 1px; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin has no result`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function is empty`, async () => {
	const { warnings, errored } = await lint(`@function --f() {}`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Expected @function "--f" to have a result descriptor (${rule_name})`,
	])
})

test(`should error when a function only has local variables`, async () => {
	const { warnings, errored } = await lint(`@function --f() { --a: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Expected @function "--f" to have a result descriptor (${rule_name})`,
	])
})
