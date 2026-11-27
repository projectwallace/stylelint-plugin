import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unknown-functions'

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

test(`should not error when a called function is defined`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: 1; } .a { width: --f(); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a function is called inside another function`, async () => {
	const { warnings, errored } = await lint(
		`@function --f() { result: 1; } @function --g() { result: --f(); }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when there are no custom functions`, async () => {
	const { warnings, errored } = await lint(`.a { width: calc(1px + 2px); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unknown function is ignored by string`, async () => {
	const { warnings, errored } = await lint(`.a { width: --x(); }`, true, { ignore: ['--x'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unknown function is ignored by RegExp`, async () => {
	const { warnings, errored } = await lint(`.a { width: --x(); }`, true, { ignore: [/^--/] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a called function is not defined`, async () => {
	const { warnings, errored } = await lint(`.a { width: --f(); }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unknown custom function "--f" (${rule_name})`,
	])
})

test(`should error when a function is called in a nested value`, async () => {
	const { warnings, errored } = await lint(`.a { width: calc(1px + --f()); }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unknown custom function "--f" (${rule_name})`,
	])
})
