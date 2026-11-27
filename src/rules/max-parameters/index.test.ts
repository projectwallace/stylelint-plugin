import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-parameters'

async function lint(code: string, primaryOption: unknown = 3, secondaryOptions?: unknown) {
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

test(`should not error when a function has the maximum number of parameters`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a, --b, --c) { result: 1; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin has fewer parameters`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) {}`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function has too many parameters`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a, --b, --c, --d) { result: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Expected no more than 3 parameters for @function --f but found 4 (${rule_name})`,
	])
})

test(`should error when a mixin has too many parameters`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a, --b, --c, --d, --e) {}`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Expected no more than 3 parameters for @mixin --m but found 5 (${rule_name})`,
	])
})

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test.each([0, -1, 1.5, '3'])('should not run when the primary option is %j', async (option) => {
	const { errored } = await lint(`@function --f() {}`, option)
	expect(errored).toBe(true)
})
