import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-custom-properties'

async function lint(code: string) {
	const config = {
		plugins: [plugin],
		rules: { [rule_name]: true },
	}
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when a custom property is declared only once', async () => {
	const { warnings, errored } = await lint(':root { --color: red; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct custom properties are declared', async () => {
	const { warnings, errored } = await lint(':root { --color: red; --size: 1rem; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when distinct custom properties appear in different rules', async () => {
	const { warnings, errored } = await lint('.a { --color: red; } .b { --size: 1rem; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when the same custom property is declared twice in the same rule', async () => {
	const { warnings, errored } = await lint(':root { --color: red; --color: blue; }')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate custom property "--color" (${rule_name})`,
	})
})

test('should error when the same custom property is declared in different rules', async () => {
	const { warnings, errored } = await lint('.a { --color: red; } .b { --color: blue; }')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate custom property "--color" (${rule_name})`,
	})
})

test('should error when the same custom property is declared three times', async () => {
	const { warnings, errored } = await lint(
		':root { --color: red; } .a { --color: blue; } .b { --color: green; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should report on the correct line and column for a duplicate', async () => {
	const { warnings } = await lint(`:root { --color: red; }
.a { --color: blue; }`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 6,
		endColumn: 13,
	})
})

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when the option is invalid', async () => {
	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; } .a { --color: blue; }',
		config: { plugins: [plugin], rules: { [rule_name]: 'invalid' } },
	})
	expect(errored).toBe(true)
})

test('should not run when the rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; } .a { --color: blue; }',
		config: { plugins: [plugin], rules: { [rule_name]: null } },
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
