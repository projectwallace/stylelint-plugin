import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-font-sizes'

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
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when 0 is configured and any font-size is used', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('Found 1 unique font sizes')
	expect(warnings[0].text).toContain('exceeds the maximum of 0')
})

test('should not error when 0 is configured and no font-size is used', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no font sizes', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique sizes are within the limit', async () => {
	const { warnings, errored } = await lint(
		`a { font-size: 16px; } b { font-size: 24px; }`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same value is reused', async () => {
	const { warnings, errored } = await lint(
		`a { font-size: 16px; } b { font-size: 16px; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations — font-size property
// ---------------------------------------------------------------------------

test('should error when unique values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { font-size: 12px; } b { font-size: 16px; } c { font-size: 24px; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toContain('Found 3 unique font sizes')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
})

test('should error at the stylesheet level (node is root)', async () => {
	const { warnings } = await lint(`a { font-size: 16px; } b { font-size: 24px; }`, 1)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(1)
})

test('should treat different value strings as different unique entries', async () => {
	// "1rem" vs "16px" are two different strings even if visually equal
	const { warnings, errored } = await lint(
		`a { font-size: 1rem; } b { font-size: 16px; }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font sizes')
})

// ---------------------------------------------------------------------------
// font shorthand property
// ---------------------------------------------------------------------------

test('should extract font-size from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: 16px Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should extract font-size with line-height from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: bold 16px/1.5 Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count sizes from font shorthand and font-size together', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; } b { font: 24px Georgia; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font sizes')
})

test('should deduplicate identical font-size values across font and font-size', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; } b { font: 16px Arial; }`, 1)
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
// Only font-size and font properties are walked
// ---------------------------------------------------------------------------

test('should not count font-weight as a size', async () => {
	const { warnings, errored } = await lint(`a { font-weight: bold; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count font-family as a size', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// allowList secondary option
// ---------------------------------------------------------------------------

test('should not count an exact string match in allowList', async () => {
	const { warnings, errored } = await lint(
		`a { font-size: 16px; } b { font-size: 24px; }`,
		1,
		{ allowList: ['16px'] },
	)
	// 16px is ignored → only 24px counts → within limit
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in allowList', async () => {
	const { warnings, errored } = await lint(
		`a { font-size: 12px; } b { font-size: 16px; } c { font-size: 24px; }`,
		1,
		{ allowList: [/^(12px|16px)$/] },
	)
	// 12px and 16px are ignored → only 24px counts → within limit
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count allowListed values from font shorthand', async () => {
	const { warnings, errored } = await lint(
		`a { font: 16px Arial; } b { font-size: 24px; }`,
		1,
		{ allowList: ['16px'] },
	)
	// 16px (from font shorthand) is ignored → only 24px counts
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when non-allowListed values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { font-size: 12px; } b { font-size: 16px; } c { font-size: 24px; }`,
		1,
		{ allowList: ['12px'] },
	)
	// 12px ignored → 16px + 24px = 2 → exceeds limit of 1
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font sizes')
})
