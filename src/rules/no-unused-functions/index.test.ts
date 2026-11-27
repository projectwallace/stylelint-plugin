import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unused-functions'

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

test(`should not error when a function is used`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: 1; } .a { width: --f(); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when there are no definitions`, async () => {
	const { warnings, errored } = await lint(`.a { color: red; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unused function is ignored by string`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: 1; }`, true, {
		ignore: ['--f'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unused function is ignored by RegExp`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: 1; }`, true, {
		ignore: [/^--/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function is never used`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unused @function "--f" (${rule_name})`,
	])
})

test(`should error when only one of two functions is used`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { result: 1; } .a { width: --f(); }@function --f2() { result: 1; }`,
	)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unused @function "--f2" (${rule_name})`,
	])
})
