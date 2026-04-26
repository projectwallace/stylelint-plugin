import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-comment-size'

test('should not run when config is set to a value lower than or equal to 0', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/* comment */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are no comments', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 100,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when comment size is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1000,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/* short comment */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when comment size exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/* this is a comment */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toBe(
		'Comment size is 23 bytes which is greater than the allowed 1 bytes (projectwallace/max-comment-size)',
	)
})

test('should ignore copyright comments starting with ! when ignoreCopyrightComments is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [1, { ignoreCopyrightComments: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/*! Copyright 2024 My Company */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still count non-copyright comments when ignoreCopyrightComments is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [1, { ignoreCopyrightComments: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/* this is a regular comment */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should count copyright comments when ignoreCopyrightComments is false', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [1, { ignoreCopyrightComments: false }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/*! Copyright 2024 */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
