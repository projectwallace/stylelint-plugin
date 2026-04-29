import recommended from './recommended.js'

export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-unique-animation-functions':
			recommended.rules['projectwallace/max-unique-animation-functions'],
		'projectwallace/max-unique-box-shadows':
			recommended.rules['projectwallace/max-unique-box-shadows'],
		'projectwallace/max-unique-color-formats':
			recommended.rules['projectwallace/max-unique-color-formats'],
		'projectwallace/max-unique-colors': recommended.rules['projectwallace/max-unique-colors'],
		'projectwallace/max-unique-durations': recommended.rules['projectwallace/max-unique-durations'],
		'projectwallace/max-unique-font-families':
			recommended.rules['projectwallace/max-unique-font-families'],
		'projectwallace/max-unique-font-sizes':
			recommended.rules['projectwallace/max-unique-font-sizes'],
		'projectwallace/max-unique-line-heights':
			recommended.rules['projectwallace/max-unique-line-heights'],
		'projectwallace/max-unique-keyframes': recommended.rules['projectwallace/max-unique-keyframes'],
		'projectwallace/max-unique-gradients': recommended.rules['projectwallace/max-unique-gradients'],
	},
}
