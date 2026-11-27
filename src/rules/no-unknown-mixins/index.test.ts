import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unknown-mixins'

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

test(`should not error when an applied mixin is defined`, async () => {
	const { warnings, errored } = await lint(`@mixin --m { color: red; } .a { @apply --m; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an applied mixin with arguments is defined`, async () => {
	const { warnings, errored } = await lint(
		`@mixin --m(--a) { color: var(--a); } .a { @apply --m(red); }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unknown mixin is ignored by string`, async () => {
	const { warnings, errored } = await lint(`.a { @apply --x; }`, true, { ignore: ['--x'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unknown mixin is ignored by RegExp`, async () => {
	const { warnings, errored } = await lint(`.a { @apply --x; }`, true, { ignore: [/^--/] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when an applied mixin is not defined`, async () => {
	const { warnings, errored } = await lint(`.a { @apply --m; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unknown mixin "--m" (${rule_name})`,
	])
})

test(`should error when an applied mixin with arguments is not defined`, async () => {
	const { warnings, errored } = await lint(`.a { @apply --m(1px) { color: red } }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unknown mixin "--m" (${rule_name})`,
	])
})
