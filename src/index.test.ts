import { test, expect } from 'vitest'
import type stylelint from 'stylelint'
import rules from './index.js'

test('exports an array of stylelint rules', () => {
	const names = rules.map((rule) => {
		const plugin = rule as Extract<stylelint.Plugin, { ruleName: string }>
		return plugin.ruleName
	})
	expect(names).toStrictEqual([
		'projectwallace/max-selector-complexity',
		'projectwallace/max-lines-of-code',
		'projectwallace/no-unused-custom-properties',
		'projectwallace/no-unknown-custom-property',
		'projectwallace/no-property-browserhacks',
		'projectwallace/no-unused-layers',
		'projectwallace/no-unused-container-names',
		'projectwallace/no-unknown-container-names',
		'projectwallace/no-anonymous-layers',
		'projectwallace/no-useless-custom-property-assignment',
		'projectwallace/no-unreachable-media-conditions',
		'projectwallace/no-static-media-query',
		'projectwallace/no-static-container-query',
		'projectwallace/max-file-size',
		'projectwallace/max-embedded-content-size',
		'projectwallace/max-comment-size',
		'projectwallace/max-average-selectors-per-rule',
		'projectwallace/max-average-declarations-per-rule',
		'projectwallace/max-average-selector-complexity',
		'projectwallace/max-important-ratio',
		'projectwallace/no-duplicate-data-urls',
		'projectwallace/max-unique-units',
		'projectwallace/min-selector-uniqueness-ratio',
		'projectwallace/min-declaration-uniqueness-ratio',
		'projectwallace/max-average-specificity',
		'projectwallace/max-selectors-per-rule',
		'projectwallace/max-declarations-per-rule',
		'projectwallace/no-invalid-z-index',
		'projectwallace/no-property-shorthand',
	])
})
