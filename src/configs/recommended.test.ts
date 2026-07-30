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

	// Some checks are covered by stylelint's own built-in rules instead of a
	// projectwallace/* rule, to avoid maintaining a second implementation of
	// something stylelint already does.
	const coreRuleNames = new Set([
		'at-rule-no-vendor-prefix',
		'block-no-empty',
		'keyframe-declaration-no-important',
		'max-nesting-depth',
		'no-unknown-custom-properties',
		'property-no-vendor-prefix',
		'selector-max-specificity',
		'selector-no-vendor-prefix',
		'value-no-vendor-prefix',
	])

	const configRuleNames = Object.keys(recommended.rules)
		.filter((name) => !coreRuleNames.has(name))
		.sort()

	expect(configRuleNames).toStrictEqual(exportedRuleNames)
})
