import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import { parse } from 'postcss'
import plugin from './index.js'

const rule_name = 'projectwallace/no-property-browserhacks'

test('should not error on a regular property', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: green }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error on a property hack', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { *zoom: 1 }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings

	expect(text).toBe(`Property "*zoom" is a browserhack and is not allowed (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(5)
})

test('should still detect browserhack when input.css offsets do not match (Svelte embedded CSS)', async () => {
	// Simulate what happens in Svelte: stylelint extracts CSS from <style>...</style>
	// but root.source.input.css may contain the full Svelte file while
	// declaration.source offsets are relative to the extracted CSS only.
	const css = 'a { *zoom: 1 }'
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
		`Property "*zoom" is a browserhack and is not allowed (${rule_name})`,
	)
})
