import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-layer-in-mixin'

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

test(`should not error when a mixin is inside a layer`, async () => {
	const { warnings, errored } = await lint(`@layer base { @mixin --m() { color: red; } }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin has no layer`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { color: red; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a style rule has a layer`, async () => {
	const { warnings, errored } = await lint(`.a { @layer x { color: red; } }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a mixin contains a layer`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { @layer base { color: red; } }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected @layer in @mixin, its contents are dropped when the mixin is applied (${rule_name})`,
	])
})
