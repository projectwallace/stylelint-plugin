import stylelint from 'stylelint';
import { test } from 'uvu'
import * as assert from 'uvu/assert'

test('should not run when config is set to a value lower than 1', async () => {
	const config = {
		plugins: ['./plugins/max-selector-complexity/index.js'],
		rules: {
			'project-wallace/max-selector-complexity': 0,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	});

	assert.is(errored, true)
	assert.equal(warnings, [])
});

test('should not error on a very simple selector', async () => {
	const config = {
		plugins: ['./plugins/max-selector-complexity/index.js'],
		rules: {
			'project-wallace/max-selector-complexity': 2,
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

test('should error on a very complex selector', async () => {
	const config = {
		plugins: ['./plugins/max-selector-complexity/index.js'],
		rules: {
			'project-wallace/max-selector-complexity': 2,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a b c d e f g {}`,
		config,
	});

	assert.is(errored, true)
	assert.equal(warnings, [
		{
			line: 1,
			column: 1,
			endLine: 1,
			endColumn: 17,
			rule: 'project-wallace/max-selector-complexity',
			severity: 'error',
			text: 'Selector complexity of "a b c d e f g" is 13 which is greater than the allowed 2',
		}
	])
});

test('should error on multiple complex selectors', async () => {
	const config = {
		plugins: ['./plugins/max-selector-complexity/index.js'],
		rules: {
			'project-wallace/max-selector-complexity': 2,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a b c d e f g {}
			a {}
			.a .b .c .d #e #f #g {}
		`,
		config,
	});

	assert.is(errored, true)
	assert.equal(warnings, [
		{
			"line": 2,
			"column": 4,
			"endLine": 2,
			"endColumn": 20,
			"rule": "project-wallace/max-selector-complexity",
			"severity": "error",
			"text": "Selector complexity of \"a b c d e f g\" is 13 which is greater than the allowed 2"
		},
		{
			"line": 4,
			"column": 4,
			"endLine": 4,
			"endColumn": 27,
			"rule": "project-wallace/max-selector-complexity",
			"severity": "error",
			"text": "Selector complexity of \".a .b .c .d #e #f #g\" is 13 which is greater than the allowed 2"
		}
	])
});

test('should error on a low-specificity/high-complexity selector', async () => {
	const config = {
		plugins: ['./plugins/max-selector-complexity/index.js'],
		rules: {
			'project-wallace/max-selector-complexity': 2,
		},
	};

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `:-moz-any(#a #b #c, #d #e #f) {}`,
		config,
	});

	assert.is(errored, true)
	assert.equal(warnings, [
		{
			"line": 1,
			"column": 1,
			"endLine": 1,
			"endColumn": 33,
			"rule": "project-wallace/max-selector-complexity",
			"severity": "error",
			"text": "Selector complexity of \":-moz-any(#a #b #c, #d #e #f)\" is 12 which is greater than the allowed 2"
		}
	])
});

test.run()
