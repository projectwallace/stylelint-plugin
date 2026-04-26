import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-embedded-content-size'

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
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
})

test('should not error when there is no embedded content', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1000,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when embedded content size is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1000000,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: url("data:image/png;base64,abc123"); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when embedded content size exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: url("data:image/png;base64,abc123"); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toContain('greater than the allowed 1 bytes')
})
