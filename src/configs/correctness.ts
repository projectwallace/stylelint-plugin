import recommended from './recommended.js'

const rules = [
	'projectwallace/no-invalid-z-index',
	'projectwallace/no-unknown-container-names',
	'projectwallace/no-unknown-custom-property',
	'projectwallace/no-unreachable-media-conditions',
	'projectwallace/no-empty-rules',
	'projectwallace/no-important-in-keyframes',
	'projectwallace/no-useless-custom-property-assignment',
	'projectwallace/no-unused-custom-properties',
	'projectwallace/no-unused-container-names',
	'projectwallace/no-unused-layers',
	'projectwallace/no-static-media-query',
	'projectwallace/no-static-container-query',
] as const

export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: Object.fromEntries(rules.map((rule) => [rule, recommended.rules[rule]])) as Pick<
		typeof recommended.rules,
		(typeof rules)[number]
	>,
}
