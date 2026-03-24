import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/min-declaration-uniqueness-ratio'

test('should not run when config is set to a negative value', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is set to a value greater than 1', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1.5,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are no declarations', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.5,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ``,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when all declarations are unique', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.5,
		},
	}

	// 3 unique declarations out of 3 total = 1.0
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1em; margin: 0; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when uniqueness ratio is exactly at the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.5,
		},
	}

	// 2 unique declarations out of 4 total = 0.5
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1em; } b { color: red; font-size: 1em; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when uniqueness ratio is below the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.5,
		},
	}

	// 1 unique declaration out of 3 total ≈ 0.33
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } b { color: red; } c { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toContain('less than the required 0.5')
})

test('should not error when config is 0', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0,
		},
	}

	// Even all duplicates, ratio is 0.33 >= 0
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } b { color: red; } c { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when config is 1 and all declarations are unique', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1em; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when config is 1 and any declaration is duplicated', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	// 1 unique out of 2 = 0.5 < 1
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
