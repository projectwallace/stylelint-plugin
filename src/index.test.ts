import { test, expect } from 'vitest'
import type stylelint from 'stylelint'
import rules from './index.js'

test('exports an array of stylelint rules', () => {
	const names = rules.map((rule) => {
		const plugin = rule as Extract<stylelint.Plugin, { ruleName: string }>
		return plugin.ruleName
	})
	expect(names).toStrictEqual([
		'project-wallace/max-selector-complexity',
		'project-wallace/max-lines-of-code',
		'project-wallace/no-unused-custom-properties',
		'project-wallace/no-unknown-custom-property',
		'project-wallace/no-property-browserhacks',
		'project-wallace/no-unused-layers',
		'project-wallace/no-unused-container-names',
		'project-wallace/no-undeclared-container-names',
		'project-wallace/no-anonymous-layers',
		'project-wallace/no-useless-custom-property-assignment',
	])
})
