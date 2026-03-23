import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-important-ratio'

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
		code: `a { color: red !important; }`,
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
		code: `a { color: red !important; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are no !important declarations', async () => {
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

test('should not error when !important ratio is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.5,
		},
	}

	// 1 !important out of 2 declarations = 0.5
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red !important; font-size: 1em; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when !important ratio exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.1,
		},
	}

	// 1 !important out of 2 declarations = 0.5
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red !important; font-size: 1em; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toContain('greater than the allowed 0.1')
})
