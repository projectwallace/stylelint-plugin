export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'project-wallace/max-lines-of-code': true,
		'project-wallace/max-selector-complexity': true,
		'project-wallace/no-anonymous-layers': true,
		'project-wallace/no-property-browserhacks': true,
		'project-wallace/no-static-container-query': true,
		'project-wallace/no-static-media-query': true,
		'project-wallace/no-undeclared-container-names': true,
		'project-wallace/no-unknown-custom-property': true,
		'project-wallace/no-unreachable-media-conditions': true,
		'project-wallace/no-unused-container-names': true,
		'project-wallace/no-unused-custom-properties': true,
		'project-wallace/no-unused-layers': true,
		'project-wallace/no-useless-custom-property-assignment': true,
	},
}
