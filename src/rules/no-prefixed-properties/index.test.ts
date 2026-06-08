import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-prefixed-properties'

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
	const { errored } = await lint('a { color: red }', false)
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when property has no vendor prefix', async () => {
	const { warnings, errored } = await lint('a { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on standard transform', async () => {
	const { warnings, errored } = await lint('a { transform: rotate(45deg) }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on custom property', async () => {
	const { warnings, errored } = await lint('a { --color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test.each([
	['-webkit-transform', 'a { -webkit-transform: rotate(45deg) }', 5, 22],
	['-moz-appearance', 'a { -moz-appearance: none }', 5, 20],
	['-ms-flex', 'a { -ms-flex: 1 }', 5, 13],
	['-o-transition', 'a { -o-transition: all 0.3s }', 5, 18],
	['-webkit-user-select', 'a { -webkit-user-select: none }', 5, 24],
])('should error when property is "%s"', async (property, code, column, endColumn) => {
	const { warnings, errored } = await lint(code, true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain(property)
	expect(warnings[0].column).toBe(column)
	expect(warnings[0].endColumn).toBe(endColumn)
})

// ---------------------------------------------------------------------------
// Ignore option
// ---------------------------------------------------------------------------

test('should not error when property matches ignore string', async () => {
	const { warnings, errored } = await lint('a { -webkit-appearance: none }', true, {
		ignore: ['-webkit-appearance'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when property matches ignore RegExp', async () => {
	const { warnings, errored } = await lint('a { -webkit-appearance: none }', true, {
		ignore: [/-webkit-/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when property does not match ignore', async () => {
	const { warnings, errored } = await lint('a { -webkit-transform: rotate(45deg) }', true, {
		ignore: ['-webkit-appearance'],
	})
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
