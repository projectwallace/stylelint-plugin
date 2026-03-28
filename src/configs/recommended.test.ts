import { test, expect } from 'vitest'
import type stylelint from 'stylelint'
import rules from '../index.js'
import recommended from './recommended.js'

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
