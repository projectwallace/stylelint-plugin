import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-prefixed-selectors'

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

test('should not error when selector has no vendor prefix', async () => {
	const { warnings, errored } = await lint('a { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on standard ::placeholder', async () => {
	const { warnings, errored } = await lint('input::placeholder { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on standard ::selection', async () => {
	const { warnings, errored } = await lint('::selection { background: blue }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test.each([
	['input::-webkit-input-placeholder { color: red }', 6, 33, '::-webkit-input-placeholder'],
	['::-moz-placeholder { color: red }', 1, 19, '::-moz-placeholder'],
	['::-webkit-scrollbar { width: 8px }', 1, 20, '::-webkit-scrollbar'],
	['::-moz-selection { background: blue }', 1, 17, '::-moz-selection'],
])(
	'should error when selector contains vendor-prefixed pseudo',
	async (selector, column, endColumn, substring) => {
		const { warnings, errored } = await lint(selector, true)
		expect(errored).toBe(true)
		expect(warnings).toHaveLength(1)
		expect(warnings[0].column).toBe(column)
		expect(warnings[0].endColumn).toBe(endColumn)
		expect(warnings[0].text).toBe(
			`Unexpected vendor-prefixed selector "${substring}" (projectwallace/no-prefixed-selectors)`,
		)
	},
)

// ---------------------------------------------------------------------------
// Ignore option
// ---------------------------------------------------------------------------

test('should not error when selector matches ignore string', async () => {
	const { warnings, errored } = await lint('::-webkit-scrollbar { width: 8px }', true, {
		ignore: ['::-webkit-scrollbar'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when selector matches ignore RegExp', async () => {
	const { warnings, errored } = await lint('::-webkit-scrollbar { width: 8px }', true, {
		ignore: [/::-webkit-scrollbar/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when selector does not match ignore', async () => {
	const { warnings, errored } = await lint('::-moz-placeholder { color: red }', true, {
		ignore: ['::-webkit-scrollbar'],
	})
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
