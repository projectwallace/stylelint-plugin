import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unreachable-if-branches'

const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when else is the last branch', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(style(--dark): white; else: black); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when else is the last branch among multiple conditions', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(style(--dark): white; style(--light): black; else: gray); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when if() has no else condition at all', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(style(--dark): white; style(--light): black); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when else is the only branch', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(else: black); }`,
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

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when else is not the last branch', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(else: black; style(--dark): white); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Unexpected else condition that is not the last branch in if() (${rule_name})`)
})

test('should error for the first of multiple else conditions when it is not last', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(style(--dark): white; else: black; else: red); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	// points at the first "else: black", not the (valid, last) "else: red"
	expect(warnings[0]).toMatchObject({ column: 37, endColumn: 48 })
})

test('should error for each if() function with a misplaced else', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: if(else: white; style(--dark): black); background: if(else: red; style(--x): blue); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should report the correct position of the misplaced else branch', async () => {
	const {
		results: [{ warnings }],
	} = await stylelint.lint({
		code: `a { color: if(else: black; style(--dark): white); }`,
		config,
	})

	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 15,
		endColumn: 26,
	})
})

test('should not run when primary option is invalid', async () => {
	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `a { color: if(else: black; style(--dark): white); }`,
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
