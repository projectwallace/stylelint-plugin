import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-layers'

async function lint(code: string, primaryOption: unknown, secondaryOptions?: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]:
				secondaryOptions === undefined ? primaryOption : [primaryOption, secondaryOptions],
		},
	}

	const {
		results: [result],
	} = await stylelint.lint({ code, config })

	return result
}

const css_1 = '@layer a { x { color: red; } }'
const css_2 = '@layer b { x { color: red; } }'
const css_3 = '@layer c { x { color: red; } }'

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when config is negative', async () => {
	const { errored } = await lint(css_1, -1)
	expect(errored).toBe(true)
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(css_1, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(css_1, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there is nothing to count', async () => {
	const { warnings, errored } = await lint('a { color: red; }', 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique count is within the limit', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count identical values once', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_1}\n${css_1}`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique count exceeds the limit', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}\n${css_3}`, 2)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(`Expected no more than 2 unique layers but found 3 (${rule_name})`)
	expect(warnings[0].line).toBe(3)
})

test('should report every value beyond the limit', async () => {
	const { warnings } = await lint(`${css_1}\n${css_2}\n${css_3}`, 1)
	expect(warnings).toHaveLength(2)
	expect(warnings[0].text).toBe(`Expected no more than 1 unique layers but found 3 (${rule_name})`)
})

test('should not report repeated values after the limit was exceeded', async () => {
	const { warnings } = await lint(`${css_1}\n${css_2}\n${css_2}\n${css_1}`, 1)
	expect(warnings).toHaveLength(1)
})

// ---------------------------------------------------------------------------
// ignore option
// ---------------------------------------------------------------------------

test('should not count an exact string match in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: ['a'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: [/^a/] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a regex string in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: ['/^a/'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Specifics
// ---------------------------------------------------------------------------

test('should count a statement and a block of the same layer once', async () => {
	const { warnings, errored } = await lint(`@layer a; @layer a { x { color: red; } }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count every name in a statement', async () => {
	const { warnings } = await lint(`@layer a, b, c;`, 2)
	expect(warnings).toHaveLength(1)
})

test('should count layers declared with @import', async () => {
	const { warnings } = await lint(
		`@import url(a.css) layer(a); @import url(b.css) layer(b); @import url(c.css) layer(c);`,
		2,
	)
	expect(warnings).toHaveLength(1)
})

test('should count nested layers by their qualified name', async () => {
	const { warnings } = await lint(
		`@layer a { @layer x { y { color: red; } } } @layer b { @layer x { y { color: red; } } }`,
		3,
	)
	// a, a.x, b, b.x => 4 unique layers
	expect(warnings).toHaveLength(1)
})

test('should not count anonymous layers', async () => {
	const { warnings, errored } = await lint(`@layer { a { color: red; } }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count the implicit parent of a dotted layer name', async () => {
	// `a` and `a.b` are two layers
	const { warnings } = await lint(`@layer a.b { x { color: red; } }`, 1)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('but found 2')
})

test('should not count a dotted layer twice when its parent is also declared', async () => {
	const { warnings, errored } = await lint(`@layer a; @layer a.b { x { color: red; } }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should report the layers that cross the limit in source order', async () => {
	const { warnings } = await lint(`@layer a;\n@layer b;\n@layer c;\n@layer d;`, 2)
	expect(warnings.map((w) => w.line)).toStrictEqual([3, 4])
})

test('should report the first appearance of a layer that is declared more than once', async () => {
	const { warnings } = await lint(`@layer a;\n@layer b;\n@layer b { x { color: red; } }`, 1)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(2)
})

test('should apply ignore to qualified names of nested layers', async () => {
	const { warnings, errored } = await lint(`@layer a { @layer x {} }`, 1, { ignore: ['a.x'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
