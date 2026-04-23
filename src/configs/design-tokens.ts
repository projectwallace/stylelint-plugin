import recommended from './recommended.js'

export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-unique-box-shadows':
			recommended.rules['projectwallace/max-unique-box-shadows'],
		'projectwallace/max-unique-colors': recommended.rules['projectwallace/max-unique-colors'],
		'projectwallace/max-unique-durations': recommended.rules['projectwallace/max-unique-durations'],
		'projectwallace/max-unique-font-families':
			recommended.rules['projectwallace/max-unique-font-families'],
		'projectwallace/max-unique-font-sizes':
			recommended.rules['projectwallace/max-unique-font-sizes'],
		'projectwallace/max-unique-gradients': recommended.rules['projectwallace/max-unique-gradients'],
	},
}
