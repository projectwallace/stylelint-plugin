import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-font-families'

async function lint(code: string, primaryOption: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: primaryOption,
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
// No violation — basic cases
// ---------------------------------------------------------------------------

test('should not error when there are no font families', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique families are within the limit', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial, sans-serif; }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same font family is reused', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Arial; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique families exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial, Helvetica, sans-serif; }`,
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
		`a { font-family: Arial; } b { font-family: Helvetica; }`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(1)
})

// ---------------------------------------------------------------------------
// font-family property
// ---------------------------------------------------------------------------

test('should count each comma-separated family individually', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial, sans-serif; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should handle quoted font family names', async () => {
	const { warnings, errored } = await lint(`a { font-family: "Helvetica Neue", Arial; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should handle single-quoted font family names', async () => {
	const { warnings, errored } = await lint(`a { font-family: 'Times New Roman', serif; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should handle multi-word unquoted font family names', async () => {
	// "Times New Roman" as unquoted identifiers counts as 1 family
	const { warnings, errored } = await lint(`a { font-family: Times New Roman, serif; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should count generic families', async () => {
	const { warnings, errored } = await lint(`a { font-family: sans-serif; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count unique families across multiple rules', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Helvetica; } c { font-family: Georgia; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 3 unique font families')
})

test('should count each same family string only once', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font-family: Arial; } c { font-family: Arial; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// font shorthand property
// ---------------------------------------------------------------------------

test('should extract font-family from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: 16px Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should extract multiple families from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: bold 16px Arial, sans-serif; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should handle complex font shorthand', async () => {
	const { warnings, errored } = await lint(
		`a { font: italic small-caps bold 12px/2 "Helvetica Neue", Arial, sans-serif; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 3 unique font families')
})

test('should count families from font shorthand with line-height', async () => {
	const { warnings, errored } = await lint(`a { font: 16px/1.5 Georgia, serif; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should count families across font-family and font shorthand declarations', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font: 16px Georgia; }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique font families')
})

test('should deduplicate families from font-family and font shorthand', async () => {
	const { warnings, errored } = await lint(
		`a { font-family: Arial; } b { font: 16px Arial; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count non-font-family font properties as families', async () => {
	// font shorthand with only system font keyword - no fallback list
	const { warnings, errored } = await lint(`a { font: bold 16px sans-serif; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Only font-family and font properties are walked
// ---------------------------------------------------------------------------

test('should not count font-size values as families', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count font-weight as families', async () => {
	const { warnings, errored } = await lint(`a { font-weight: bold; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
