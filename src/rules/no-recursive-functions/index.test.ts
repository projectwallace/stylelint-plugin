import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-recursive-functions'

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

test(`should not error when a function calls another function`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: --g(); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a function calls itself in a conditional rule`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { @media (unknown-feature) { result: --f(); } result: 1; }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function calls itself in the result`, async () => {
	const { warnings, errored } = await lint(`@function --f(--x) { result: --f(10); }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected recursive call of @function "--f" in its own body (${rule_name})`,
	])
})

test(`should error when a function calls itself in a local variable`, async () => {
	const { warnings, errored } = await lint(`@function --f() { --x: --f(); result: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected recursive call of @function "--f" in its own body (${rule_name})`,
	])
})
