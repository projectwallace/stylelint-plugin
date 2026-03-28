import recommended from './recommended.js'

const rules = [
	'projectwallace/max-lines-of-code',
	'projectwallace/no-unused-layers',
	'projectwallace/no-duplicate-data-urls',
	'projectwallace/max-file-size',
	'projectwallace/max-embedded-content-size',
] as const

export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		...Object.fromEntries(rules.map((rule) => [rule, recommended.rules[rule]])) as Pick<typeof recommended.rules, (typeof rules)[number]>,
		// Stricter than recommended: no comments allowed for performance
		'projectwallace/max-comment-size': 0,
	},
}
