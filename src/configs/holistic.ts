export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		// Global count rules
		'projectwallace/max-atrules': 250,
		'projectwallace/max-rules': 1000,
		'projectwallace/max-declarations': 5000,
		'projectwallace/max-comments': [64, { ignoreCopyrightComments: true }],
		'projectwallace/max-lines-of-code': 10_000,
		'projectwallace/max-file-size': 200_000,
		'projectwallace/max-embedded-content-size': 10_000,

		// Average / ratio rules
		'projectwallace/max-average-declarations-per-rule': 6,
		'projectwallace/max-average-selectors-per-rule': 3,
		'projectwallace/max-average-selector-specificity': [0.02, 2.5, 1],
		'projectwallace/max-average-selector-complexity': 3,
		'projectwallace/max-important-ratio': 0.1,
		'projectwallace/min-declaration-uniqueness-ratio': 0.5,
		'projectwallace/min-selector-uniqueness-ratio': 0.66,

		// Unique value tracking rules
		'projectwallace/max-unique-colors': 128,
		'projectwallace/max-unique-color-formats': 4,
		'projectwallace/max-unique-font-families': 4,
		'projectwallace/max-unique-font-sizes': 16,
		'projectwallace/max-unique-line-heights': 12,
		'projectwallace/max-unique-z-indexes': 8,
		'projectwallace/max-unique-units': 10,
		'projectwallace/max-unique-durations': 8,
		'projectwallace/max-unique-animation-functions': 4,
		'projectwallace/max-unique-gradients': 8,
		'projectwallace/max-unique-box-shadows': 8,
		'projectwallace/max-unique-text-shadows': 4,
		'projectwallace/max-unique-keyframes': 8,
		'projectwallace/max-unique-media-queries': 12,
		'projectwallace/max-unique-supports-queries': 8,

		// Cross-reference rules (defined vs. used)
		'projectwallace/no-unused-keyframes': true,
		'projectwallace/no-unused-custom-properties': true,
		'projectwallace/no-unused-layers': true,
		'projectwallace/no-unused-container-names': true,
	},
}
