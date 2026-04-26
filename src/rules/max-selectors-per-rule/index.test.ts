import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-selectors-per-rule'

test('should not run when config is set to a value lower than or equal to 0', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: `a, b, c { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
})

test('should not error when selectors per rule is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 3,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, b, c { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when selectors per rule exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, b, c { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toBe(
		'Selectors per rule is 3 which is greater than the allowed 2 (projectwallace/max-selectors-per-rule)',
	)
})

test('should check each rule independently', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	// First rule has 3 selectors (violation), second has 1 (ok)
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, b, c { color: red; } d { color: blue; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should report violation on the correct rule node', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 10,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, b, c, d, e, f, g, h, i, j, k { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		'Selectors per rule is 11 which is greater than the allowed 10 (projectwallace/max-selectors-per-rule)',
	)
})
