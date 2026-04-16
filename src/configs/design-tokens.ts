import recommended from './recommended.js'

export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-unique-colors': recommended.rules['projectwallace/max-unique-colors'],
	},
}
