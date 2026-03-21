import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-average-declarations-per-rule'

test('should not run when config is set to a value lower than or equal to 0', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
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

test('should not error when average declarations per rule is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 5,
		},
	}

	// 1 declaration each → mean = 1
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } b { color: blue; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when average declarations per rule exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	// 3 declarations for one rule → mean = 3
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1em; margin: 0; }`,
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
