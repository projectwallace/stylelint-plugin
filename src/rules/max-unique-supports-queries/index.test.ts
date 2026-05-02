import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-supports-queries'

async function lint(code: string, primaryOption: unknown, secondaryOptions?: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]:
				secondaryOptions !== undefined ? [primaryOption, secondaryOptions] : primaryOption,
		},
	}

	const {
		results: [result],
	} = await stylelint.lint({ code, config })

	return result
}

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when config is negative', async () => {
	const { errored } = await lint(`@supports (display: grid) {}`, -1)
	expect(errored).toBe(true)
})

test('should error when 0 is configured and any supports query is used', async () => {
	const { warnings, errored } = await lint(`@supports (display: grid) {}`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		'Found 1 unique supports queries ((display: grid)) which exceeds the maximum of 0 (projectwallace/max-unique-supports-queries)',
	)
})

test('should not error when 0 is configured and no supports query is used', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(`@supports (display: grid) {}`, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`@supports (display: grid) {}`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no supports queries', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique queries are within the limit', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) {} @supports (display: flex) {}`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same query is reused', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) {} @supports (display: grid) {}`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique queries exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) {} @supports (display: flex) {} @supports (display: contents) {}`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toBe(
		'Found 3 unique supports queries ((display: grid), (display: flex), (display: contents)) which exceeds the maximum of 2 (projectwallace/max-unique-supports-queries)',
	)
})

test('should error at the at-rule level', async () => {
	const { warnings } = await lint(
		`
		@supports (display: grid) {}
		@supports (display: flex) {}
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

test('should treat different query strings as different unique entries', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) {} @supports not (display: grid) {}`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique supports queries ((display: grid), not (display: grid)) which exceeds the maximum of 1 (projectwallace/max-unique-supports-queries)',
	)
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count an exact string match in ignore', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) {} @supports (display: flex) {}`,
		1,
		{ ignore: ['(display: grid)'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) {} @supports (display: flex) {} @supports (display: contents) {}`,
		1,
		{ ignore: [/display: flex|display: contents/] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when non-ignored values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) {} @supports (display: flex) {} @supports (display: contents) {}`,
		1,
		{ ignore: ['(display: grid)'] },
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique supports queries ((display: flex), (display: contents)) which exceeds the maximum of 1 (projectwallace/max-unique-supports-queries)',
	)
})
