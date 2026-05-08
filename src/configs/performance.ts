export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-lines-of-code': 10_000,
		'projectwallace/no-unused-layers': true,
		'projectwallace/no-duplicate-data-urls': true,
		'projectwallace/no-empty-rules': true,
		'projectwallace/max-file-size': 200_000,
		'projectwallace/max-embedded-content-size': 10_000,
		'projectwallace/max-comment-size': 0,
	},
}
