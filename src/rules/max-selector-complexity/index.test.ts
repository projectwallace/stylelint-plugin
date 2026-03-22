import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import { parse } from 'postcss'
import plugin from './index.js'

const rule_name = 'projectwallace/max-selector-complexity'

test('should not run when config is set to a value lower than 1', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toStrictEqual([])
})

test('should not error on a very simple selector', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a very simple selector list', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, b {}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error on a very complex selector', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a b c d e f g {}`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 1,
		endLine: 1,
		endColumn: 17,
		rule: 'projectwallace/max-selector-complexity',
		severity: 'error',
		text: 'Selector complexity of "a b c d e f g" is 13 which is greater than the allowed 2 (projectwallace/max-selector-complexity)',
	})
})

test('should error on multiple complex selectors', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a b c d e f g {}
			a {}
			.a .b .c .d #e #f #g {}
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 4,
		endLine: 2,
		endColumn: 20,
		rule: 'projectwallace/max-selector-complexity',
		severity: 'error',
		text: 'Selector complexity of "a b c d e f g" is 13 which is greater than the allowed 2 (projectwallace/max-selector-complexity)',
	})
	expect(warnings[1]).toMatchObject({
		line: 4,
		column: 4,
		endLine: 4,
		endColumn: 27,
		rule: 'projectwallace/max-selector-complexity',
		severity: 'error',
		text: 'Selector complexity of ".a .b .c .d #e #f #g" is 13 which is greater than the allowed 2 (projectwallace/max-selector-complexity)',
	})
})

test('should error on a low-specificity/high-complexity selector', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `:-moz-any(#a #b #c, #d #e #f) {}`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 1,
		endLine: 1,
		endColumn: 33,
		rule: 'projectwallace/max-selector-complexity',
		severity: 'error',
		text: 'Selector complexity of ":-moz-any(#a #b #c, #d #e #f)" is 12 which is greater than the allowed 2 (projectwallace/max-selector-complexity)',
	})
})

test('should only report the one selector in a list thats problematic', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a a a a, b {}`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 1,
		endLine: 1,
		endColumn: 14,
		rule: 'projectwallace/max-selector-complexity',
		severity: 'error',
		text: 'Selector complexity of "a a a a" is 7 which is greater than the allowed 2 (projectwallace/max-selector-complexity)',
	})
})

test('should still detect complex selector when input.css offsets do not match (Svelte embedded CSS)', async () => {
	const css = 'a b c d e f g {}'
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
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
		`Selector complexity of "a b c d e f g" is 13 which is greater than the allowed 2 (${rule_name})`,
	)
})
