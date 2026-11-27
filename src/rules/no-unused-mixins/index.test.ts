import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unused-mixins'

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

test(`should not error when a mixin is used`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; } .a { @apply --m; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when there are no definitions`, async () => {
	const { warnings, errored } = await lint(`.a { color: red; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unused mixin is ignored by string`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; }`, true, {
		ignore: ['--m'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unused mixin is ignored by RegExp`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; }`, true, {
		ignore: [/^--/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a mixin is never used`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unused @mixin "--m" (${rule_name})`,
	])
})

test(`should error when only one of two mixins is used`, async () => {
	const { warnings, errored } = await lint(
		`@mixin --m() { color: red; } .a { @apply --m; }@mixin --m2() { color: red; }`,
	)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unused @mixin "--m2" (${rule_name})`,
	])
})
