import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-empty-rules'
const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

test('should not error for a rule with declarations', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `a { color: red; }`, config })

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for an at-rule with declarations', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `@media screen { a { color: red; } }`, config })

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for a rule with nested rules that have declarations', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `a { &:hover { color: red; } }`, config })

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for at-rule statements (no block)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `@charset "UTF-8"; @layer test;`, config })

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error for an empty rule', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `a {}`, config })

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Empty rules are not allowed (${rule_name})`)
})

test('should error for a rule containing only comments', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `a { /* comment */ }`, config })

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should error for an empty at-rule block', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `@media screen {}`, config })

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Empty rules are not allowed (${rule_name})`)
})

test('should error for an at-rule containing only comments', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `@media screen { /* comment */ }`, config })

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should error for each empty rule', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `a {} b {} c {}`, config })

	expect(errored).toBe(true)
	expect(warnings.length).toBe(3)
})

test('should error for an empty nested rule', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `a { &:hover {} }`, config })

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should error for a parent rule that only contains an empty nested rule', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code: `a { &:hover {} color: red; }`, config })

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should not run when primary option is invalid', async () => {
	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `a {}`,
		config: {
			plugins: [plugin],
			rules: { [rule_name]: [2] },
		},
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings.length).toBeGreaterThan(0)
})

// allow: ['rules']

test('should not error for an empty rule when allow includes "rules"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['rules'] }] } },
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error for an empty at-rule when allow includes "rules"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@media screen {}`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['rules'] }] } },
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

// allow: ['atrules']

test('should not error for an empty at-rule when allow includes "atrules"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@media screen {}`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['atrules'] }] } },
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error for an empty rule when allow includes "atrules"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['atrules'] }] } },
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

// allow: ['comments']

test('should not error for a rule containing only comments when allow includes "comments"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { /* comment */ }`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['comments'] }] } },
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for an at-rule containing only comments when allow includes "comments"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@media screen { /* comment */ }`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['comments'] }] } },
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error for a fully empty rule when allow includes "comments"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['comments'] }] } },
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should still error for a fully empty at-rule when allow includes "comments"', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@media screen {}`,
		config: { plugins: [plugin], rules: { [rule_name]: [true, { allow: ['comments'] }] } },
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

// allow: ['rules', 'atrules', 'comments']

test('should not error for anything when all options are allowed', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {} @media screen {} a { /* comment */ } @media screen { /* comment */ }`,
		config: {
			plugins: [plugin],
			rules: { [rule_name]: [true, { allow: ['rules', 'atrules', 'comments'] }] },
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when secondary option value is invalid', async () => {
	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `a {}`,
		config: {
			plugins: [plugin],
			rules: { [rule_name]: [true, { allow: ['invalid-value'] }] },
		},
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings.length).toBeGreaterThan(0)
})
