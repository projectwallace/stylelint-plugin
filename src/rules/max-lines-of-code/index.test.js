import stylelint from 'stylelint';
import { test } from 'uvu'
import * as assert from 'uvu/assert'

const rule_name = 'project-wallace/max-lines-of-code'
const rule_path = './src/rules/max-lines-of-code/index.js'

test('should not run when config is set to a value lower than 0', async () => {
	const config = {
		plugins: [rule_path],
		rules: {
			[rule_name]: -1,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	});

	assert.is(errored, false)
	assert.equal(warnings, [])
});

test('should not error on a very simple stylesheet with max-lines=2', async () => {
	const config = {
		plugins: [rule_path],
		rules: {
			[rule_name]: 2,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	});

	assert.is(errored, false)
	assert.equal(warnings, [])
});

test('should error when lines of code exceeds allowed setting', async () => {
	const config = {
		plugins: [rule_path],
		rules: {
			[rule_name]: 2,
		},
	};

	let code = `
		a {
			color: green;
		}

		a {
			color: red;
		}
	`

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code,
		config,
	});

	assert.is(errored, true)
	assert.equal(warnings, [
		{
			line: 1,
			column: 1,
			endLine: 9,
			endColumn: 3,
			rule: rule_name,
			severity: 'error',
			text: 'Counted 4 Lines of Code which is greater than the allowed 2 (project-wallace/max-lines-of-code)',
		}
	])
});

test.run()
