import recommended from './recommended.js'

const rules = [
	'projectwallace/max-average-declarations-per-rule',
	'projectwallace/max-average-selector-complexity',
	'projectwallace/max-average-selectors-per-rule',
	'projectwallace/max-average-specificity',
	'projectwallace/max-declarations-per-rule',
	'projectwallace/max-important-ratio',
	'projectwallace/max-selector-complexity',
	'projectwallace/max-selectors-per-rule',
	'projectwallace/max-unique-units',
	'projectwallace/min-declaration-uniqueness-ratio',
	'projectwallace/min-selector-uniqueness-ratio',
	'projectwallace/no-anonymous-layers',
	'projectwallace/no-property-browserhacks',
	'projectwallace/no-property-shorthand',
	'projectwallace/max-spacing-resets',
] as const

export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: Object.fromEntries(rules.map((rule) => [rule, recommended.rules[rule]])) as Pick<
		typeof recommended.rules,
		(typeof rules)[number]
	>,
}
