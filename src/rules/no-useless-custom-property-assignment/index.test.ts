import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import { parse } from 'postcss'
import plugin from './index.js'

const rule_name = 'projectwallace/no-useless-custom-property-assignment'

const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

test('should not error when a custom property is assigned a plain value', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a custom property is assigned another property via var()', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color-1: red; --color-2: var(--color-1); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error on self-assignment: --color: var(--color)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: var(--color); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--color" is assigned to itself via var(), which has no effect (${rule_name})`,
	)
})

test('should error on fallback self-reference: --color-2: var(--color-1, var(--color-2))', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color-1: green; --color-2: var(--color-1, var(--color-2)); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--color-2" is assigned to itself via var(), which has no effect (${rule_name})`,
	)
})

test('should error on deeply nested self-reference', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: var(--other, var(--fallback, var(--color))); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--color" is assigned to itself via var(), which has no effect (${rule_name})`,
	)
})

test('should only report once even if the same self-reference appears multiple times', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: var(--color) var(--color); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should not error when allowList matches the property as a string', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: var(--color); }',
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { allowList: ['--color'] }],
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when allowList matches the property as a RegExp', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color-primary: var(--color-primary); }',
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { allowList: [/^--color-/] }],
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error on self-assignment not matched by allowList', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: var(--color); --bg: var(--bg); }',
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { allowList: ['--color'] }],
			},
		},
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--bg" is assigned to itself via var(), which has no effect (${rule_name})`,
	)
})

test('should not error on regular var() usage in non-custom properties', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; } a { color: var(--color); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still detect self-assignment when input.css offsets do not match (Svelte embedded CSS)', async () => {
	// Simulate what happens in Svelte: stylelint extracts CSS from <style>...</style>
	// but root.source.input.css may contain the full Svelte file while
	// declaration.source offsets are relative to the extracted CSS only.
	const css = ':root { --color: var(--color); }'
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
		`"--color" is assigned to itself via var(), which has no effect (${rule_name})`,
	)
})
