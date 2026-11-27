import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-parameters'

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

test(`should not error when parameter names are unique`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a, --b) {} @mixin --m(--a, --b) {}`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when different definitions reuse a name`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a) {} @function --g(--a) {}`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function repeats a parameter`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a, --a) {}`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected duplicate parameter "--a" of @function --f (${rule_name})`,
	])
})

test(`should error when a mixin repeats a parameter`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a <length>, --b, --a: 1px) {}`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected duplicate parameter "--a" of @mixin --m (${rule_name})`,
	])
})
