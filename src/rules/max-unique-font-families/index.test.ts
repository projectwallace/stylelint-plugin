import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-font-families'

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
	const { warnings, errored } = await lint(`a { font-family: Arial; }`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when 0 is configured and any font-family is used', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial; }`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('Found 1 unique font families')
	expect(warnings[0].text).toContain('exceeds the maximum of 0')
})

test('should not error when 0 is configured and no font-family is used', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial; }`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no font families', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique families are within the limit', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial; } b { font-family: Georgia; }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same value is reused', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial, sans-serif; } b { font-family: Arial, sans-serif; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count a comma-separated list as one unique value', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial, sans-serif; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations — font-family property
// ---------------------------------------------------------------------------

test('should error when unique values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Georgia; } c { font-family: monospace; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toContain('Found 3 unique font families')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
})

test('should error at the stylesheet level (node is root)', async () => {
	const { warnings } = await lint(
		`a { font-family: Arial; } b { font-family: Georgia; }`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(1)
})

test('should treat different value strings as different unique entries', async () => {
	// "Arial, sans-serif" vs "Arial" are two different strings
	const { warnings, errored } = await lint(
		`a { font-family: Arial, sans-serif; } b { font-family: Arial; }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

// ---------------------------------------------------------------------------
// font shorthand property
// ---------------------------------------------------------------------------

test('should extract font-family from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: 16px Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should extract font-family list from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: bold 16px Arial, sans-serif; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count families from font shorthand and font-family together', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font: 16px Georgia; }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should deduplicate identical font-family values across font and font-family', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font: 16px Arial; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should handle complex font shorthand', async () => {
	const { warnings, errored } = await lint(
		`a { font: italic bold 12px/2 "Helvetica Neue", Arial, sans-serif; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Only font-family and font properties are walked
// ---------------------------------------------------------------------------

test('should not count font-weight as a family', async () => {
	const { warnings, errored } = await lint(`a { font-weight: bold; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count font-size as a family', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// allowList secondary option
// ---------------------------------------------------------------------------

test('should not count an exact string match in allowList', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Georgia; }`,
		1,
		{ allowList: ['Arial'] },
	)
	// Arial is ignored → only Georgia counts → within limit
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in allowList', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Georgia; } c { font-family: monospace; }`,
		1,
		{ allowList: [/^(Arial|Georgia)$/] },
	)
	// Arial and Georgia are ignored → only monospace counts → within limit
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count allowListed values from font shorthand', async () => {
	const { warnings, errored } = await lint(
		`a { font: 16px Arial; } b { font-family: Georgia; }`,
		1,
		{ allowList: ['Arial'] },
	)
	// Arial (from font shorthand) is ignored → only Georgia counts
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still count non-allowListed values', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Georgia; }`,
		1,
		{ allowList: ['Arial'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when non-allowListed values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Georgia; } c { font-family: monospace; }`,
		1,
		{ allowList: ['Arial'] },
	)
	// Arial ignored → Georgia + monospace = 2 → exceeds limit of 1
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})
