import { test, expect } from 'vitest'
import stylelint from 'stylelint'
import rules from '../index.js'
import recommended from './recommended.js'

test('recommended config runs without invalid option warnings', async () => {
	const {
		results: [result],
	} = await stylelint.lint({
		code: 'a { color: red; }',
		config: {
			plugins: rules,
			rules: recommended.rules,
		},
	})
	expect(result.invalidOptionWarnings).toHaveLength(0)
})

test('recommended config contains exactly all exported rules', () => {
	const exportedRuleNames = rules
		.map((rule) => {
			const plugin = rule as Extract<stylelint.Plugin, { ruleName: string }>
			return plugin.ruleName
		})
		.sort()

	const configRuleNames = Object.keys(recommended.rules).sort()

	expect(configRuleNames).toStrictEqual(exportedRuleNames)
})
