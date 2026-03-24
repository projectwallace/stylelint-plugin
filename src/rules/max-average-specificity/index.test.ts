import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-average-specificity'

test('should not run with invalid option (not a string)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `#a { color: red; }`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings).toHaveLength(1)
})

test('should not run with invalid option (wrong format)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,1',
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `#a { color: red; }`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings).toHaveLength(1)
})

test('should not run with invalid option (negative number)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,-1,0',
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `#a { color: red; }`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings).toHaveLength(1)
})

test('should not error when there are no selectors', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,0,1',
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@charset "UTF-8";`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when average specificity is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,2.5,1',
		},
	}

	// Simple selectors → low specificity
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } b { color: blue; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when average specificity equals the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,0,1',
		},
	}

	// `a` has specificity [0, 0, 1]
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when average specificity exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,0,0',
		},
	}

	// `a` has specificity [0, 0, 1] which exceeds [0, 0, 0]
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toContain('greater than the allowed')
})

test('should error when average specificity with ids exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,2.5,1',
		},
	}

	// Many id selectors → high a-component
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `#a { color: red; } #b { color: blue; } #c { color: green; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
})

test('should allow float values in the primary option', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: '0,0.5,1.5',
		},
	}

	// `a` has specificity [0, 0, 1], `b` has [0, 0, 1], average is [0, 0, 1]
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } b { color: blue; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
