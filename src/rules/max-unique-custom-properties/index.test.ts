import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-custom-properties'

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

const css_1 = ':root { --a: 1; }'
const css_2 = ':root { --b: 1; }'
const css_3 = ':root { --c: 1; }'

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
		`Expected no more than 2 unique custom properties but found 3 (${rule_name})`,
	)
	expect(warnings[0].line).toBe(3)
})

test('should report every value beyond the limit', async () => {
	const { warnings } = await lint(`${css_1}\n${css_2}\n${css_3}`, 1)
	expect(warnings).toHaveLength(2)
	expect(warnings[0].text).toBe(
		`Expected no more than 1 unique custom properties but found 3 (${rule_name})`,
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
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: ['--a'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: [/^--a/] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a regex string in ignore', async () => {
	const { warnings, errored } = await lint(`${css_1}\n${css_2}`, 1, { ignore: ['/^--a/'] })
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Specifics
// ---------------------------------------------------------------------------

test('should count a redeclared custom property once', async () => {
	const { warnings, errored } = await lint(
		`:root { --a: 1; } @media (prefers-color-scheme: dark) { :root { --a: 2; } }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should treat custom property names as case-sensitive', async () => {
	const { warnings } = await lint(`:root { --a: 1; --A: 1; }`, 1)
	expect(warnings).toHaveLength(1)
})

test('should not count regular properties or var() usages', async () => {
	const { warnings, errored } = await lint(`a { color: var(--a); margin: 0; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// @property registrations
// ---------------------------------------------------------------------------

const registration = (name: string) =>
	`@property ${name} { syntax: "<length>"; inherits: false; initial-value: 0px; }`

test('should count custom properties registered with @property', async () => {
	const { warnings, errored } = await lint(
		`${registration('--a')}\n${registration('--b')}\n${registration('--c')}`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Expected no more than 2 unique custom properties but found 3 (${rule_name})`,
	)
	expect(warnings[0].line).toBe(3)
})

test('should not error when @property registrations are within the limit', async () => {
	const { warnings, errored } = await lint(`${registration('--a')}\n${registration('--b')}`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count a property that is both registered and declared once', async () => {
	const { warnings, errored } = await lint(`${registration('--a')}\n:root { --a: 1px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count registered and declared properties together', async () => {
	const { warnings } = await lint(`${registration('--a')}\n:root { --b: 1px; --c: 2px; }`, 2)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('but found 3')
})

test('should report the first node in source order that crosses the limit', async () => {
	const { warnings } = await lint(
		`:root { --a: 1px; }\n${registration('--b')}\n:root { --c: 1px; }`,
		2,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

test('should report on the @property rule', async () => {
	const { warnings } = await lint(`:root { --a: 1px; }\n${registration('--b')}`, 1)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(2)
})

test('should treat @property names as case-sensitive', async () => {
	const { warnings } = await lint(`${registration('--a')}\n${registration('--A')}`, 1)
	expect(warnings).toHaveLength(1)
})

test('should not count an @property whose name is not a custom property', async () => {
	const { warnings, errored } = await lint(registration('size'), 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count an @property without a name', async () => {
	const { warnings, errored } = await lint(`@property { syntax: "*"; inherits: false; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count an @property that is ignored', async () => {
	const { warnings, errored } = await lint(`${registration('--a')}\n${registration('--b')}`, 1, {
		ignore: ['--a'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
