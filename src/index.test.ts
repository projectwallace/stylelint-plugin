import { test, expect } from 'vitest'
import type stylelint from 'stylelint'
import rules from './index.js'

test('exports an array of stylelint rules', () => {
	const names = rules.map((rule) => {
		const plugin = rule as Extract<stylelint.Plugin, { ruleName: string }>
		return plugin.ruleName
	})
	expect(names).toStrictEqual([
		'projectwallace/max-average-declarations-per-rule',
		'projectwallace/max-average-selector-complexity',
		'projectwallace/max-average-selectors-per-rule',
		'projectwallace/max-average-specificity',
		'projectwallace/max-comment-size',
		'projectwallace/max-declarations-per-rule',
		'projectwallace/max-embedded-content-size',
		'projectwallace/max-file-size',
		'projectwallace/max-important-ratio',
		'projectwallace/max-lines-of-code',
		'projectwallace/max-selector-complexity',
		'projectwallace/max-selectors-per-rule',
		'projectwallace/max-spacing-resets',
		'projectwallace/max-unique-animation-functions',
		'projectwallace/max-unique-box-shadows',
		'projectwallace/max-unique-colors',
		'projectwallace/max-unique-durations',
		'projectwallace/max-unique-font-families',
		'projectwallace/max-unique-font-sizes',
		'projectwallace/max-unique-gradients',
		'projectwallace/max-unique-line-heights',
		'projectwallace/max-unique-units',
		'projectwallace/min-declaration-uniqueness-ratio',
		'projectwallace/min-selector-uniqueness-ratio',
		'projectwallace/no-anonymous-layers',
		'projectwallace/no-duplicate-data-urls',
		'projectwallace/no-invalid-z-index',
		'projectwallace/no-property-browserhacks',
		'projectwallace/no-property-shorthand',
		'projectwallace/no-static-container-query',
		'projectwallace/no-static-media-query',
		'projectwallace/no-unknown-container-names',
		'projectwallace/no-unknown-custom-property',
		'projectwallace/no-unreachable-media-conditions',
		'projectwallace/no-unused-container-names',
		'projectwallace/no-unused-custom-properties',
		'projectwallace/no-unused-layers',
		'projectwallace/no-useless-custom-property-assignment',
	])
})
