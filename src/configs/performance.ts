export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-lines-of-code': [10_000, { severity: 'warning' }],
		'projectwallace/no-unused-keyframes': true,
		'projectwallace/no-unused-layers': true,
		'projectwallace/no-duplicate-data-urls': true,
		'block-no-empty': [true, { ignore: ['comments'] }],
		'projectwallace/max-file-size': [200_000, { severity: 'warning' }],
		'projectwallace/max-embedded-content-size': [10_000, { severity: 'warning' }],
		'projectwallace/max-comment-size': [
			0,
			{
				ignoreCopyrightComments: true,
				severity: 'warning',
			},
		],
		'projectwallace/max-comments': [
			0,
			{
				ignoreCopyrightComments: true,
				severity: 'warning',
			},
		],
	},
}
