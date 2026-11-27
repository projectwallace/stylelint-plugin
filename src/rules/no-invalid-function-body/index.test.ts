import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-invalid-function-body'

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

test(`should not error when a function has a result and local variables`, async () => {
	const { warnings, errored } = await lint(`@function --f() { --a: 1; result: var(--a); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin has regular declarations`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when the result is in a conditional rule`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { @media (width > 1px) { result: 1; } }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function has a misspelled result`, async () => {
	const { warnings, errored } = await lint(`@function --f() { retrun: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected property "retrun" in @function, only result and custom properties are valid (${rule_name})`,
	])
})

test(`should error when a function has a regular declaration`, async () => {
	const { warnings, errored } = await lint(`@function --f() { color: red; result: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected property "color" in @function, only result and custom properties are valid (${rule_name})`,
	])
})
