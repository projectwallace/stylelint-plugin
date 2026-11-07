import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-border-radiuses'

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

const css_1 = 'a { border-radius: 2px; }'
const css_2 = 'b { border-radius: 4px; }'
const css_3 = 'c { border-radius: 8px; }'

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
		`Expected no more than 2 unique border radiuses but found 3 (${rule_name})`,
	)
	expect(warnings[0].line).toBe(3)
})

test('should report every value beyond the limit', async () => {
	const { warnings } = await lint(`${css_1}\n${css_2}\n${css_3}`, 1)
	expect(warnings).toHaveLength(2)
	expect(warnings[0].text).toBe(
		`Expected no more than 1 unique border radiuses but found 3 (${rule_name})`,
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
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: ['2px'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: [/^2/] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a regex string in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: ['/^2/'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Specifics
// ---------------------------------------------------------------------------

test('should count longhand properties', async () => {
	const { warnings } = await lint(
		`a { border-top-left-radius: 2px; } b { border-bottom-right-radius: 4px; } c { border-start-end-radius: 8px; }`,
		2,
	)
	expect(warnings).toHaveLength(1)
})

test('should not count keywords', async () => {
	const { warnings } = await lint(`a { border-radius: inherit; } b { border-radius: 2px; }`, 1)
	expect(warnings).toStrictEqual([])
})

test('should count a two-value radius as a single unique value', async () => {
	const { warnings, errored } = await lint(
		`a { border-radius: 2px 4px; } b { border-radius: 2px 4px; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count a two-value radius as different from a single value', async () => {
	const { warnings } = await lint(`a { border-radius: 2px; } b { border-radius: 2px 4px; }`, 1)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Expected no more than 1 unique border radiuses but found 2 (${rule_name})`,
	)
})

test('should count differently ordered two-value radii separately', async () => {
	const { warnings } = await lint(`a { border-radius: 2px 4px; } b { border-radius: 4px 2px; }`, 1)
	expect(warnings).toHaveLength(1)
})

test('should ignore extra whitespace between values', async () => {
	const { warnings, errored } = await lint(
		`a { border-radius: 2px 4px; } b { border-radius: 2px    4px; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count a radius with a slash as a single unique value', async () => {
	const { warnings, errored } = await lint(
		`a { border-radius: 4px / 3px; } b { border-radius: 4px / 3px; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count a radius with a slash as different from one without', async () => {
	const { warnings } = await lint(`a { border-radius: 4px; } b { border-radius: 4px / 3px; }`, 1)
	expect(warnings).toHaveLength(1)
})

test('should treat spacing around the slash as the same value', async () => {
	const { warnings, errored } = await lint(
		`a { border-radius: 4px/3px; } b { border-radius: 4px / 3px; } c { border-radius: 4px /3px; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count a multi-value radius with a slash as a single unique value', async () => {
	const { warnings, errored } = await lint(
		`a { border-radius: 10px 5% / 20px 30px; } b { border-radius: 10px 5%/20px 30px; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should match ignore against the raw value of a radius with a slash', async () => {
	const { warnings, errored } = await lint(
		`a { border-radius: 4px/3px; } b { border-radius: 8px; }`,
		1,
		{ ignore: ['4px/3px'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
