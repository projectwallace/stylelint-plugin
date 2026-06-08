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
	['a { display: -webkit-flex }', 14, 26],
	['a { background: -webkit-linear-gradient(top, red, blue) }', 17, 56],
])('should error when value contains vendor prefix', async (code, column, endColumn) => {
	const { warnings, errored } = await lint(code, true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].column).toBe(column)
	expect(warnings[0].endColumn).toBe(endColumn)
})

test('should error on custom property', async () => {
	const { warnings, errored } = await lint('a { --display: -webkit-flex }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].column).toBe(16) // "-webkit-flex" inside "--display: "
	expect(warnings[0].endColumn).toBe(28)
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
