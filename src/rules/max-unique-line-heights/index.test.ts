import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-line-heights'

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
	const { warnings, errored } = await lint(`a { line-height: 1.5; }`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when 0 is configured and any line-height is used', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; }`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('Found 1 unique line heights')
	expect(warnings[0].text).toContain('exceeds the maximum of 0')
})

test('should not error when 0 is configured and no line-height is used', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; }`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no line heights', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique heights are within the limit', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; } b { line-height: 2; }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same value is reused', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; } b { line-height: 1.5; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations — line-height property
// ---------------------------------------------------------------------------

test('should error when unique values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { line-height: 1; } b { line-height: 1.5; } c { line-height: 2; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toContain('Found 3 unique line heights')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
})

test('should error at the declaration level', async () => {
	const { warnings } = await lint(
		`
		a { line-height: 1.5; }
		b { line-height: 2; }
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

test('should treat different value strings as different unique entries', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; } b { line-height: 24px; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique line heights')
})

// ---------------------------------------------------------------------------
// font shorthand property
// ---------------------------------------------------------------------------

test('should extract line-height from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: 16px/1.5 Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count heights from font shorthand and line-height together', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; } b { font: 16px/2 Georgia; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique line heights')
})

test('should deduplicate identical line-height values across font and line-height', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; } b { font: 16px/1.5 Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count font shorthand without line-height', async () => {
	const { warnings, errored } = await lint(`a { font: 16px Arial; }`, 0)
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
// Only line-height and font properties are walked
// ---------------------------------------------------------------------------

test('should not count font-size as a line height', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count font-family as a line height', async () => {
	const { warnings, errored } = await lint(`a { font-family: Arial; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count an exact string match in ignore', async () => {
	const { warnings, errored } = await lint(`a { line-height: 1.5; } b { line-height: 2; }`, 1, {
		ignore: ['1.5'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(
		`a { line-height: 1; } b { line-height: 1.5; } c { line-height: 2; }`,
		1,
		{ ignore: [/^(1|1\.5)$/] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count ignored values from font shorthand', async () => {
	const { warnings, errored } = await lint(`a { font: 16px/1.5 Arial; } b { line-height: 2; }`, 1, {
		ignore: ['1.5'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when non-ignored values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { line-height: 1; } b { line-height: 1.5; } c { line-height: 2; }`,
		1,
		{ ignore: ['1'] },
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique line heights')
})

// ---------------------------------------------------------------------------
// CSS keywords
// ---------------------------------------------------------------------------

test.each(['inherit', 'initial', 'unset', 'revert', 'revert-layer'])(
	'should not count %s as a unique line height',
	async (keyword) => {
		const { warnings, errored } = await lint(`a { line-height: ${keyword}; }`, 0)
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

test('should count design token heights while ignoring keywords mixed in', async () => {
	const { warnings, errored } = await lint(
		`a { line-height: 1.5; } b { line-height: inherit; } c { line-height: 2; }`,
		1,
	)
	// inherit is a keyword and is not counted → 1.5 + 2 = 2 → exceeds limit of 1
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique line heights')
})
