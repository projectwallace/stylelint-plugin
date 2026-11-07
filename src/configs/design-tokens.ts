import type { PresetConfig } from '../utils/preset-config.js'

const config: PresetConfig = {
	plugins: ['@projectwallace/stylelint-plugin'],
	rules: {
		'projectwallace/max-unique-animation-functions': [4, { severity: 'warning' }],
		'projectwallace/max-unique-box-shadows': [8, { severity: 'warning' }],
		'projectwallace/max-unique-border-radiuses': [8, { severity: 'warning' }],
		'projectwallace/max-unique-custom-properties': [256, { severity: 'warning' }],
		'projectwallace/max-unique-text-shadows': [4, { severity: 'warning' }],
		'projectwallace/max-unique-color-formats': [4, { severity: 'warning' }],
		'projectwallace/max-unique-colors': [128, { severity: 'warning' }],
		'projectwallace/max-unique-durations': [8, { severity: 'warning' }],
		'projectwallace/max-unique-font-families': [4, { severity: 'warning' }],
		'projectwallace/max-unique-font-sizes': [16, { severity: 'warning' }],
		'projectwallace/max-unique-line-heights': [12, { severity: 'warning' }],
		'projectwallace/max-unique-keyframes': [8, { severity: 'warning' }],
		'projectwallace/max-unique-gradients': [8, { severity: 'warning' }],
	},
}

export default config
