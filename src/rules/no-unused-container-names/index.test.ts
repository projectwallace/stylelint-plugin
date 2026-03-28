import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unused-container-names'

test('should not error when a container name is declared and used', async () => {
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
			.sidebar { container-name: sidebar; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple container names are declared and used', async () => {
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
			.sidebar { container-name: sidebar test; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
			@container test (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a container name is declared but never used', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "sidebar" was declared but never used in a @container query (${rule_name})`,
	)
})

test('should error when a container name is declared in shorthand with multiple names but never used', async () => {
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
			.sidebar { container-name: sidebar test; }
			@container sidebar (min-width: 30rem) { .thing { color: red; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "test" was declared but never used in a @container query (${rule_name})`,
	)
})

test('should not error when there are no container names', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: red; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when container shorthand name is used', async () => {
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
			.sidebar { container: sidebar / inline-size; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when container shorthand name is never used', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container: sidebar / inline-size; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "sidebar" was declared but never used in a @container query (${rule_name})`,
	)
})

test('should not error when container-name is none', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: none; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when container shorthand is none', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container: none; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should handle multiple container names declared on one element', async () => {
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
			.sidebar { container-name: sidebar header; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "header" was declared but never used in a @container query (${rule_name})`,
	)
})

test('should not error on anonymous @container queries', async () => {
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
			.sidebar { container-name: sidebar; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
			@container (min-width: 400px) { .other { color: red; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when allowList string matches unused container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['sidebar'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when allowList RegExp matches unused container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: [/^side/] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when allowList does not match the unused container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['header'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "sidebar" was declared but never used in a @container query (${rule_name})`,
	)
})
