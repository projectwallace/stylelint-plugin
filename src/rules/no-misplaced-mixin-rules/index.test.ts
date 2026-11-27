import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-misplaced-mixin-rules'

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

test(`should not error when a mixin is at the top level`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { @contents; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a mixin is in a layer`, async () => {
	const { warnings, errored } = await lint(`@layer a { @mixin --m() {} }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when @apply is in a style rule`, async () => {
	const { warnings, errored } = await lint(`.a { @apply --m; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when @apply is in a nested at-rule`, async () => {
	const { warnings, errored } = await lint(`.a { @media (width > 1px) { @apply --m; } }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when @apply is in a mixin`, async () => {
	const { warnings, errored } = await lint(`@mixin --m() { @apply --n; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a mixin is nested in a style rule`, async () => {
	const { warnings, errored } = await lint(`.a { @mixin --m() {} }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected @mixin inside a style rule, @mixin can only be used at the top level (${rule_name})`,
	])
})

test(`should error when @contents is used outside of a mixin`, async () => {
	const { warnings, errored } = await lint(`.a { @contents; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected @contents outside of a @mixin, it is ignored (${rule_name})`,
	])
})

test(`should error when @apply is used at the top level`, async () => {
	const { warnings, errored } = await lint(`@apply --m;`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected @apply outside of a style rule or @mixin, it is ignored (${rule_name})`,
	])
})

test(`should error when @apply is used in a top level @media`, async () => {
	const { warnings, errored } = await lint(`@media (width > 1px) { @apply --m; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected @apply outside of a style rule or @mixin, it is ignored (${rule_name})`,
	])
})
