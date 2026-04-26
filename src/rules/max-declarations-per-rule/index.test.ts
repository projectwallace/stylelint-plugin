import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-declarations-per-rule'

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
		code: `a { color: red; font-size: 1rem; }`,
		config,
	})

	expect(errored).toBe(true)
})

test('should not error when declarations per rule is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 3,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1rem; font-weight: bold; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when declarations per rule exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1rem; font-weight: bold; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toContain('greater than the allowed 2')
})

test('should check each rule independently', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	// First rule has 3 declarations (violation), second has 1 (ok)
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1rem; font-weight: bold; } b { color: blue; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should not count nested rules declarations against parent', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; &:hover { color: blue; } }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should report violation on the correct rule node', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 14,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; font-size: 1rem; font-weight: bold; line-height: 1.5; letter-spacing: 0; text-align: left; text-decoration: none; display: block; margin: 0; padding: 0; border: 0; background: none; outline: none; cursor: pointer; opacity: 1; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('greater than the allowed 14')
})
