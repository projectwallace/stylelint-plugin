import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import { parse } from 'postcss'
import plugin from './index.js'

const rule_name = 'projectwallace/no-undeclared-container-names'

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

test('should error when a container name is used in @container but never declared', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "sidebar" is used in a @container query but was never declared (${rule_name})`,
	)
})

test('should not error when there are no @container queries', async () => {
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

test('should not error when container shorthand name is declared and used', async () => {
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

test('should not error when container shorthand with multiple names is declared and used', async () => {
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
			.sidebar { container: sidebar test / inline-size; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
			@container test (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
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
		code: '@container (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with negated query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container not (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with style query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container style(--responsive: true) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with scroll-state query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container scroll-state(scrollable: right) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared name matched by allowList string', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['sidebar'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared name matched by allowList RegExp', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: [/^side/] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when allowList does not match the undeclared container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['header'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "sidebar" is used in a @container query but was never declared (${rule_name})`,
	)
})

test('should handle multiple @container queries referencing the same undeclared name once', async () => {
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
			@container sidebar (min-width: 700px) { .a { color: red; } }
			@container sidebar (min-width: 1000px) { .b { color: blue; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should error for each unique undeclared container name', async () => {
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
			@container sidebar (min-width: 700px) { .a { color: red; } }
			@container header (min-width: 700px) { .b { color: blue; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should still detect undeclared container name when input.css offsets do not match (Svelte embedded CSS)', async () => {
	const css = '@container sidebar (min-width: 700px) { .a { color: red; } }'
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}
	const svelteCustomSyntax = {
		parse(code: string, opts: object) {
			const root = parse(code, opts)
			;(root.source!.input as unknown as { css: string }).css =
				'<script>const x = 1</script><style>' + code + '</style>'
			return root
		},
		stringify: (await import('postcss')).stringify,
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: css,
		config,
		customSyntax: svelteCustomSyntax as never,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Container name "sidebar" is used in a @container query but was never declared (${rule_name})`,
	)
})
