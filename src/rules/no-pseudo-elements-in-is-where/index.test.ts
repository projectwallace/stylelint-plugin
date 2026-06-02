import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-pseudo-elements-in-is-where'

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

test('should not error for normal rules', async () => {
	const { warnings, errored } = await lint('a { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for pseudo-class inside :is()', async () => {
	const { warnings, errored } = await lint(':is(:hover, :focus) { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for pseudo-class inside :where()', async () => {
	const { warnings, errored } = await lint(':where(:hover, :focus) { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for type selectors inside :is()', async () => {
	const { warnings, errored } = await lint(':is(a, button) { color: red }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for pseudo-elements outside :is() or :where()', async () => {
	const { warnings, errored } = await lint('a::before { content: "" }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error for ::before inside :is()', async () => {
	const { warnings, errored } = await lint(':is(::before, ::after) { content: "" }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should error for ::before inside :where()', async () => {
	const { warnings, errored } = await lint(':where(::before) { content: "" }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error for ::after inside :is()', async () => {
	const { warnings, errored } = await lint(':is(::after) { content: "" }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error for pseudo-element mixed with valid selectors inside :is()', async () => {
	const { warnings, errored } = await lint(':is(a, ::before) { color: red }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error for ::placeholder inside :is()', async () => {
	const { warnings, errored } = await lint(':is(::placeholder) { color: red }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
