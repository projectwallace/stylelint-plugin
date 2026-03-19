import { test, expect } from 'vitest'
import rules from "./index.js";

test('exports an array of stylelint rules', () => {
	expect(rules.map(rule => rule.ruleName)).toStrictEqual([
		'project-wallace/max-selector-complexity',
		'project-wallace/max-lines-of-code',
		'project-wallace/no-unused-custom-properties',
		'project-wallace/no-property-browserhacks'
	])
})
