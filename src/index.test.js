import { test } from "uvu";
import * as assert from "uvu/assert";
import rules from "./index.js";

test('exports an array of stylelint rules', () => {
	assert.equal(rules.map(rule => rule.ruleName), [
		'project-wallace/max-selector-complexity',
		'project-wallace/max-lines-of-code',
		'project-wallace/no-unused-custom-properties',
		'project-wallace/no-property-browserhacks'
	])
})

test.run()
