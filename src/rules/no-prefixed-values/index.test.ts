import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-prefixed-values'

async function lint(code: string, primaryOption: unknown, secondaryOptions?: unknown) {
	const {
		results: [result],
	} = await stylelint.lint({
		code,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]:
					secondaryOptions !== undefined ? [primaryOption, secondaryOptions] : primaryOption,
			},
		},
	})
	return result
}

// ---------------------------------------------------------------------------
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when option is invalid', async () => {
	const { errored } = await lint('a { display: flex }', false)
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when value has no vendor prefix', async () => {
	const { warnings, errored } = await lint('a { display: flex }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on standard linear-gradient', async () => {
	const { warnings, errored } = await lint(
		'a { background: linear-gradient(to bottom, red, blue) }',
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test.each([
	['a { display: -webkit-flex }'],
	['a { background: -webkit-linear-gradient(top, red, blue) }'],
])('should error when value contains vendor prefix', async (code) => {
	const { warnings, errored } = await lint(code, true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error on custom property', async () => {
	const { warnings, errored } = await lint('a { --display: -webkit-flex }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

// ---------------------------------------------------------------------------
// Ignore option
// ---------------------------------------------------------------------------

test('should not error when value matches ignore string', async () => {
	const { warnings, errored } = await lint('a { width: -webkit-fill-available }', true, {
		ignore: ['-webkit-fill-available'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when value matches ignore RegExp', async () => {
	const { warnings, errored } = await lint('a { width: -webkit-fill-available }', true, {
		ignore: [/-webkit-fill-available/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when value does not match ignore', async () => {
	const { warnings, errored } = await lint('a { display: -webkit-flex }', true, {
		ignore: ['-webkit-fill-available'],
	})
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
