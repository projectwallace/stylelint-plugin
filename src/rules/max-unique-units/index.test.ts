import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-units'

test('should not run when config is set to a value lower than 1', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: `a { font-size: 12px; }`,
		config,
	})

	expect(errored).toBe(true)
})

test('should not error when there are no units', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
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

test('should not error when unique units are within the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font-size: 12px; height: 3vw; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same unit is used multiple times', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font-size: 12px; width: 100px; height: 50px; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when unique units exceed the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font-size: 12px; height: 3vw; line-height: 2rem; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toContain(
		'Found 3 unique CSS units (px, vw, rem) which is greater than the allowed 2',
	)
})

test('should treat units case-insensitively', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font-size: 12PX; width: 100px; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count % as a unit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { width: 100%; height: 50%; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error at the declaration level', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings }],
	} = await stylelint.lint({
		code: `
a { font-size: 12px; }
b { margin: 1rem; }
c { padding: 10%; }
		`,
		config,
	})

	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(4)
})
