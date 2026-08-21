export default {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		// Global count rules
		'projectwallace/max-atrules': [250, { severity: 'warning' }],
		'projectwallace/max-rules': [1000, { severity: 'warning' }],
		'projectwallace/max-declarations': [5000, { severity: 'warning' }],
		'projectwallace/max-comments': [64, { ignoreCopyrightComments: true, severity: 'warning' }],
		'projectwallace/max-lines-of-code': [10_000, { severity: 'warning' }],
		'projectwallace/max-file-size': [200_000, { severity: 'warning' }],
		'projectwallace/max-embedded-content-size': [10_000, { severity: 'warning' }],

		// Average / ratio rules
		'projectwallace/max-average-declarations-per-rule': [6, { severity: 'warning' }],
		'projectwallace/max-average-selectors-per-rule': [3, { severity: 'warning' }],
		'projectwallace/max-average-selector-specificity': [[0.02, 2.5, 1], { severity: 'warning' }],
		'projectwallace/max-average-selector-complexity': [3, { severity: 'warning' }],
		'projectwallace/max-important-ratio': [0.1, { severity: 'warning' }],
		'projectwallace/min-declaration-uniqueness-ratio': [0.5, { severity: 'warning' }],
		'projectwallace/min-selector-uniqueness-ratio': [0.66, { severity: 'warning' }],

		// Unique value tracking rules
		'projectwallace/max-unique-colors': [128, { severity: 'warning' }],
		'projectwallace/max-unique-color-formats': [4, { severity: 'warning' }],
		'projectwallace/max-unique-font-families': [4, { severity: 'warning' }],
		'projectwallace/max-unique-font-sizes': [16, { severity: 'warning' }],
		'projectwallace/max-unique-line-heights': [12, { severity: 'warning' }],
		'projectwallace/max-unique-z-indexes': [8, { severity: 'warning' }],
		'projectwallace/max-unique-units': [10, { severity: 'warning' }],
		'projectwallace/max-unique-durations': [8, { severity: 'warning' }],
		'projectwallace/max-unique-animation-functions': [4, { severity: 'warning' }],
		'projectwallace/max-unique-gradients': [8, { severity: 'warning' }],
		'projectwallace/max-unique-box-shadows': [8, { severity: 'warning' }],
		'projectwallace/max-unique-text-shadows': [4, { severity: 'warning' }],
		'projectwallace/max-unique-keyframes': [8, { severity: 'warning' }],
		'projectwallace/max-unique-media-queries': [12, { severity: 'warning' }],
		'projectwallace/max-unique-supports-queries': [8, { severity: 'warning' }],

		// Cross-reference rules (defined vs. used)
		'projectwallace/no-unused-keyframes': true,
		'projectwallace/no-unused-custom-properties': true,
		'projectwallace/no-unused-layers': true,
		'projectwallace/no-unused-container-names': true,

		// Duplicate detection
		'projectwallace/no-duplicate-anchor-names': true,
		'projectwallace/no-duplicate-container-names': true,
		'projectwallace/no-duplicate-custom-properties': true,
		'projectwallace/no-duplicate-keyframes': true,
		'projectwallace/no-duplicate-registered-properties': true,
	},
}
