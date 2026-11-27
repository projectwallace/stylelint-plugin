import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-shadowed-parameters'

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

test(`should not error when a local variable has a different name`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a) { --b: 1; result: var(--a); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin sets a custom property with a parameter name`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) { --a: 1; color: var(--a); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a local variable shadows a parameter`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a) { --a: 2; result: var(--a); }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected local variable "--a" that shadows a parameter of @function --f (${rule_name})`,
	])
})

test(`should error when a @private property shadows a mixin parameter`, async () => {
	const { warnings, errored } = await lint(
		`@mixin --m(--a) { @private { --a: 2; } color: var(--a); }`,
	)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected local variable "--a" that shadows a parameter of @mixin --m (${rule_name})`,
	])
})
