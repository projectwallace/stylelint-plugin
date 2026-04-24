import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-file-size'

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
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when file size is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 200000,
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

test('should error when file size exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 10,
		},
	}

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
	expect(warnings[0].text).toBe(
		'File size is 17 byte which is 7 byte greater than the allowed 10 byte (projectwallace/max-file-size)',
	)
})
