import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-average-selectors-per-rule'

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

test('should not error when average selectors per rule is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	// 1 selector each → mean = 1
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } b { color: blue; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when average selectors per rule exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	// 3 selectors for one rule → mean = 3
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
	expect(warnings[0].text).toContain('greater than the allowed 1')
})
