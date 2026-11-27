import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-empty-mixins'

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

test(`should not error when a mixin has a declaration`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin only contains @contents`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { @contents; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a mixin is empty`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() {}`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected empty @mixin "--m" (${rule_name})`,
	])
})

test(`should error when a mixin only has a comment`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { /* todo */ }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected empty @mixin "--m" (${rule_name})`,
	])
})
