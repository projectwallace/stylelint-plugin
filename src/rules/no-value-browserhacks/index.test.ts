import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-value-browserhacks'

async function lint(code: string, primaryOption: unknown) {
	const {
		results: [result],
	} = await stylelint.lint({
		code,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: primaryOption,
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

test('should not error when value has no browserhack', async () => {
	const { warnings, errored } = await lint('a { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a normal multi-word value', async () => {
	const { warnings, errored } = await lint('a { background: red url("foo.png") }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when value ends with \\9 (IE9 hack)', async () => {
	const { warnings, errored } = await lint('a { background: red\\9 }', true)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings
	expect(text).toBe(`Value "red\\9" is a browserhack and is not allowed (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(5)
})

test('should error on color value with \\9 hack', async () => {
	const { warnings, errored } = await lint('a { color: blue\\9 }', true)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Value "blue\\9" is a browserhack and is not allowed (${rule_name})`)
})
