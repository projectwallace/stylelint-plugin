import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-lines-of-code'

test('should not run when config is set to a value lower than 0', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	})

	expect(errored).toBe(true)
})

test('should not error on a very simple stylesheet with max-lines=2', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when lines of code exceeds allowed setting', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const code = `
		a {
			color: green;
		}

		a {
			color: red;
		}
	`

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 1,
		endLine: 9,
		endColumn: 3,
		rule: rule_name,
		severity: 'error',
		text: 'Counted 4 Lines of Code which is greater than the allowed 2 (projectwallace/max-lines-of-code)',
	})
})
