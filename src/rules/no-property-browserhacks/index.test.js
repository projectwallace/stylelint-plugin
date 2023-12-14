import stylelint from 'stylelint';
import { test } from 'uvu'
import * as assert from 'uvu/assert'

const rule_name = 'project-wallace/no-property-browserhacks'

test('should not error on a regular property', async () => {
	const config = {
		plugins: ['./src/rules/no-property-browserhacks/index.js'],
		rules: {
			[rule_name]: true,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: green }`,
		config,
	});

	assert.is(errored, false, 'Expected to pass, but errored')
	assert.equal(warnings, [])
});

test('should error on a property hack', async () => {
	const config = {
		plugins: ['./src/rules/no-property-browserhacks/index.js'],
		rules: {
			[rule_name]: true,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { *zoom: 1 }',
		config,
	});

	assert.is(errored, true, 'Expected to error, but passed')
	assert.is(warnings.length, 1)

	const [{ line, column, text }] = warnings;

	assert.is(text, `Property "*zoom" is a browserhack and is not allowed`)
	assert.is(line, 1)
	assert.is(column, 5)
});

test.run()
