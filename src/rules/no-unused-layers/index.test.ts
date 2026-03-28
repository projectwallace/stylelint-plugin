import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unused-layers'

test('should not error when a declared layer is defined in a block', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer utilities;
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a layer in an ordering list is also defined', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, utilities;
			@layer reset { * { margin: 0; } }
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are only layer block definitions (no ordering statements)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset { * { margin: 0; } }
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a layer in an ordering list is never defined', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, utilities;
			@layer reset { * { margin: 0; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Layer "utilities" was declared but never defined (${rule_name})`)
})

test('should error when a single-name layer statement is never defined', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@layer utilities;`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Layer "utilities" was declared but never defined (${rule_name})`)
})

test('should error for each undeclared layer in a list', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@layer reset, utilities, theme;`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(3)
})

test('should not error when an unused layer is in the allowlist (string)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					allowlist: ['utilities'],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, utilities;
			@layer reset { * { margin: 0; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when an unused layer matches the allowlist (RegExp)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					allowlist: [/^vendor-/],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, vendor-reset;
			@layer reset { * { margin: 0; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error for layers not in the allowlist when allowlist is set', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					allowlist: ['utilities'],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, utilities, theme;
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should not run when primary option is invalid', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [2],
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `@layer utilities;`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings.length).toBeGreaterThan(0)
})

test('should not error when no layer statements exist', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
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
