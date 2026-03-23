export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-lines-of-code': 10000,
		'projectwallace/no-unused-layers': true,
		'projectwallace/no-duplicate-data-urls': true,
		'projectwallace/max-file-size': 200000,
		'projectwallace/max-embedded-content-size': 10000,
		'projectwallace/max-comment-size': 0,
	},
}
