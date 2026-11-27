import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-mixins'

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

test(`should not error when mixin names are unique`, async () => {
	const { warnings, errored } = await lint(
		`@mixin --m() { color: red; }@mixin --m2() { color: red; }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when the same mixin name is defined in different layers`, async () => {
	const { warnings, errored } = await lint(
		`@layer a { @mixin --m() { color: red; } } @layer b { @mixin --m() { color: red; } }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when the same mixin name is defined twice`, async () => {
	const { warnings, errored } = await lint(
		`@mixin --m() { color: red; }@mixin --m() { color: red; }`,
	)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected duplicate @mixin "--m" (${rule_name})`,
	])
})

test(`should error when the same mixin name is defined three times`, async () => {
	const { warnings, errored } = await lint(
		`@mixin --m() { color: red; }@mixin --m() { color: red; }@mixin --m() { color: red; }`,
	)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected duplicate @mixin "--m" (${rule_name})`,
		`Unexpected duplicate @mixin "--m" (${rule_name})`,
	])
})
