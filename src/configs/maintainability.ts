export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-average-declarations-per-rule': 6,
		'projectwallace/max-average-selector-complexity': 3,
		'projectwallace/max-average-selectors-per-rule': 3,
		'projectwallace/max-average-specificity': [0, 2.5, 1],
		'projectwallace/max-declarations-per-rule': 15,
		'projectwallace/max-important-ratio': 0.1,
		'projectwallace/max-selector-complexity': 15,
		'projectwallace/max-selectors-per-rule': 10,
		'projectwallace/max-unique-units': 10,
		'projectwallace/min-declaration-uniqueness-ratio': 0.5,
		'projectwallace/min-selector-uniqueness-ratio': 0.66,
		'projectwallace/no-anonymous-layers': true,
		'projectwallace/no-property-browserhacks': true,
	},
}
