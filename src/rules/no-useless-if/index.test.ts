import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-useless-if'

const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when if() has a condition and an else', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(style(--dark): white; else: black); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when if() has multiple conditions and an else', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(style(--dark): white; style(--light): black; else: gray); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when if() has a single condition and no else', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(style(--dark): white); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there is no if() function', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test("should not error when if() has multiple else branches (not this rule's concern)", async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(else: black; else: red); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when if() has only an else branch', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(else: black); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Unexpected if() with only an else branch (${rule_name})`)
})

test('should error for each if() function with only an else branch', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(else: white); background: if(else: red); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should report the correct position of the useless if()', async () => {
	const {
		results: [{ warnings }],
	} = await stylelint.lint({
		code: `a { color: if(else: black); }`,
		config,
	})

	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 12,
		endColumn: 27,
	})
})

test('should not run when primary option is invalid', async () => {
	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `a { color: if(else: black); }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [2],
			},
		},
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings.length).toBeGreaterThan(0)
})
