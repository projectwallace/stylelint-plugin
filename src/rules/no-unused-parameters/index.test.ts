import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unused-parameters'

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

test(`should not error when all parameters are used in a function`, async () => {
	const { warnings, errored } = await lint(
		`@function --f(--a, --b) { result: calc(var(--a) + var(--b)); }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a parameter is used in a mixin declaration`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--c) { color: var(--c); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a parameter is used in a fallback`, async () => {
	const { warnings, errored } = await lint(
		`@function --f(--a, --b) { result: var(--a, var(--b)); }`,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a parameter is used in an @apply argument`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) { @apply --n(var(--a)); }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when a parameter is used in a nested rule`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) { & > * { gap: var(--a); } }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when there are no parameters`, async () => {
	const { warnings, errored } = await lint(`@function --f() { result: 1; }`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unused parameter is ignored by string`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a) { result: 1; }`, true, {
		ignore: ['--a'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test(`should not error when an unused parameter is ignored by RegExp`, async () => {
	const { warnings, errored } = await lint(`@function --f(--_a) { result: 1; }`, true, {
		ignore: [/^--_/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test(`should error when a function parameter is unused`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a, --b) { result: var(--a); }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unused parameter "--b" of @function --f (${rule_name})`,
	])
})

test(`should error when a mixin parameter is unused`, async () => {
	const { warnings, errored } = await lint(`@mixin --m(--a) { color: red; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unused parameter "--a" of @mixin --m (${rule_name})`,
	])
})

test(`should error when several parameters are unused`, async () => {
	const { warnings, errored } = await lint(`@function --f(--a, --b) { result: 1; }`)
	expect(errored).toBe(true)
	expect(warnings.map((w) => w.text)).toStrictEqual([
		`Unexpected unused parameter "--a" of @function --f (${rule_name})`,
		`Unexpected unused parameter "--b" of @function --f (${rule_name})`,
	])
})
