import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-comments'

test('should not run when config is set to a negative value', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: `/* comment */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
})

test('should not error when there are no comments', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0,
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

test('should not error when comment count is within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/* one */ /* two */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when comment count exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/* one */ /* two */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toBe(
		'Comment count is 2 which is greater than the allowed 1 (projectwallace/max-comments)',
	)
})

test('should not error when limit is 0 and there are no comments', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0,
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

test('should error when limit is 0 and there is a comment', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `/* comment */ a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should ignore copyright comments starting with ! when ignoreCopyrightComments is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, { ignoreCopyrightComments: true }],
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
			[rule_name]: [0, { ignoreCopyrightComments: true }],
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
			[rule_name]: [0, { ignoreCopyrightComments: false }],
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
