import stylelint from 'stylelint';
import { test } from 'uvu'
import * as assert from 'uvu/assert'

const rule_name = 'project-wallace/no-unused-custom-properties'

test('should not error on a single used custom property', async () => {
	const config = {
		plugins: ['./src/rules/no-unused-custom-properties/index.js'],
		rules: {
			'project-wallace/no-unused-custom-properties': true,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a {
				--used: 1;
				color: var(--used);
			}`,
		config,
	});

	assert.is(errored, false, 'Expected to pass, but errored')
	assert.equal(warnings, [])
});

test('should not error on when a custom property is used in a fallback var()', async () => {
	const config = {
		plugins: ['./src/rules/no-unused-custom-properties/index.js'],
		rules: {
			'project-wallace/no-unused-custom-properties': true,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a {
				--used-in-fallback: 1;
				color: var(--not-defined, var(--used-in-fallback));
			}`,
		config,
	});

	assert.is(errored, false, 'Expected to pass, but errored')
	assert.equal(warnings, [])
});

test('should error on a single unused custom property', async () => {
	const config = {
		plugins: ['./src/rules/no-unused-custom-properties/index.js'],
		rules: {
			'project-wallace/no-unused-custom-properties': true,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { --unused: 1 }',
		config,
	});

	assert.is(errored, true, 'Expected to error, but passed')
	assert.is(warnings.length, 1)

	const [{ line, column, text }] = warnings;

	assert.is(text, `"--unused" was declared but never used in a var() (${rule_name})`)
	assert.is(line, 1)
	assert.is(column, 5)
});

test('should not error on when an unused custom property is allowed in options.ignoreProperties (string)', async () => {
	const config = {
		plugins: ['./src/rules/no-unused-custom-properties/index.js'],
		rules: {
			'project-wallace/no-unused-custom-properties': [
				true,
				{
					ignoreProperties: ['--ignored'],
				},
			],
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --ignored: 1 }`,
		config,
	});

	assert.is(errored, false, 'Expected to error, but passed')
	assert.equal(warnings, [])
});

test('should not error on when an unused custom property is allowed in options.ignoreProperties (RegExp)', async () => {
	const config = {
		plugins: ['./src/rules/no-unused-custom-properties/index.js'],
		rules: {
			'project-wallace/no-unused-custom-properties': [
				true,
				{
					ignoreProperties: [/regex/],
				},
			],
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --regexp-ingored: 1 }`,
		config,
	});

	assert.is(errored, false, 'Expected to error, but passed')
	assert.equal(warnings, [])
});

test('ignores options when options.ignoreProperties types are incorrect', async () => {
	const config = {
		plugins: ['./src/rules/no-unused-custom-properties/index.js'],
		rules: {
			'project-wallace/no-unused-custom-properties': [
				true,
				{
					ignoreProperties: [false],
				},
			],
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --unused: 1 }`,
		config,
	});

	assert.is(errored, true)
	assert.is(warnings.length, 1)

	const [{ line, column, text }] = warnings;

	assert.is(text, `"--unused" was declared but never used in a var() (${rule_name})`)
	assert.is(line, 1)
	assert.is(column, 5)
});

test.run()
