import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-attribute-selectors'

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

const css_1 = '[type="text"] { color: red; }'
const css_2 = '[type="email"] { color: red; }'
const css_3 = '[type="url"] { color: red; }'

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
	expect(warnings[0].text).toBe(
		`Expected no more than 2 unique attribute selectors but found 3 (${rule_name})`,
	)
	expect(warnings[0].line).toBe(3)
})

test('should report every value beyond the limit', async () => {
	const { warnings } = await lint(`${css_1}\n${css_2}\n${css_3}`, 1)
	expect(warnings).toHaveLength(2)
	expect(warnings[0].text).toBe(
		`Expected no more than 1 unique attribute selectors but found 3 (${rule_name})`,
	)
})

test('should not report repeated values after the limit was exceeded', async () => {
	const { warnings } = await lint(`${css_1}\n${css_2}\n${css_2}\n${css_1}`, 1)
	expect(warnings).toHaveLength(1)
})

// ---------------------------------------------------------------------------
// ignore option
// ---------------------------------------------------------------------------

test('should not count an exact string match in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: ['[type="text"]'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: [/^\[type="text/] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a regex string in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, {
		ignore: ['/^\\[type="text/'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Specifics
// ---------------------------------------------------------------------------

test('should count identical attribute selectors in different rules once', async () => {
	const { warnings, errored } = await lint(`a[href] {} b[href] {} c[href] {}`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count attribute selectors nested in :not()', async () => {
	const { warnings } = await lint(`a:not([hidden]):is([disabled]) {}`, 1)
	expect(warnings).toHaveLength(1)
})

test('should count attribute selectors in nested rules', async () => {
	const { warnings } = await lint(`a { &[href] {} &[target] {} }`, 1)
	expect(warnings).toHaveLength(1)
})

test('should not count keyframe selectors', async () => {
	const { warnings, errored } = await lint(
		`@keyframes x { from { opacity: 0; } to { opacity: 1; } }`,
		0,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
