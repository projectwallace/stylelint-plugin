export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-lines-of-code': 15,
		'projectwallace/max-selector-complexity': 15,
		'projectwallace/no-anonymous-layers': true,
		'projectwallace/no-property-browserhacks': true,
		'projectwallace/no-static-container-query': true,
		'projectwallace/no-static-media-query': true,
		'projectwallace/no-undeclared-container-names': true,
		'projectwallace/no-unknown-custom-property': true,
		'projectwallace/no-unreachable-media-conditions': true,
		'projectwallace/no-unused-container-names': true,
		'projectwallace/no-unused-custom-properties': true,
		'projectwallace/no-unused-layers': true,
		'projectwallace/no-useless-custom-property-assignment': true,
	},
}
