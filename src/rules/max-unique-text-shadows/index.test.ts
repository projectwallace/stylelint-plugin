import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-text-shadows'

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
	const { errored } = await lint(`a { text-shadow: 1px 1px red; }`, -1)
	expect(errored).toBe(true)
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(`a { text-shadow: 1px 1px red; }`, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { text-shadow: 1px 1px red; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation — basic cases
// ---------------------------------------------------------------------------

test('should not error when there are no text-shadows', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique text-shadows are within the limit', async () => {
	const { warnings, errored } = await lint(
		`a { text-shadow: 1px 1px red; } b { text-shadow: 2px 2px blue; }`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same text-shadow is reused', async () => {
	const { warnings, errored } = await lint(
		`a { text-shadow: 1px 1px red; } b { text-shadow: 1px 1px red; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for text-shadow: none', async () => {
	const { warnings, errored } = await lint(`a { text-shadow: none; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique text-shadows exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`
		a { text-shadow: 1px 1px red; }
		b { text-shadow: 2px 2px blue; }
		c { text-shadow: 3px 3px green; }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toBe(
		'Found 3 unique text shadows (1px 1px red, 2px 2px blue, 3px 3px green) which exceeds the maximum of 2 (projectwallace/max-unique-text-shadows)',
	)
	expect(warnings[0].line).toBe(4)
})

test('should error at the declaration level', async () => {
	const { warnings } = await lint(
		`
		a { text-shadow: 1px 1px red; }
		b { text-shadow: 2px 2px blue; }
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

// ---------------------------------------------------------------------------
// Shadow values
// ---------------------------------------------------------------------------

test('should detect a simple offset shadow', async () => {
	const { warnings, errored } = await lint(`a { text-shadow: 2px 4px red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect a shadow with blur radius', async () => {
	const { warnings, errored } = await lint(`a { text-shadow: 0 2px 4px red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect a multi-layer shadow as a single unique value', async () => {
	const { warnings, errored } = await lint(`a { text-shadow: 1px 1px red, 2px 2px blue; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Uniqueness
// ---------------------------------------------------------------------------

test('should treat different shadow values as different unique shadows', async () => {
	const { warnings, errored } = await lint(
		`
		a { text-shadow: 1px 1px red; }
		b { text-shadow: 2px 2px red; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique text shadows (1px 1px red, 2px 2px red) which exceeds the maximum of 1 (projectwallace/max-unique-text-shadows)',
	)
	expect(warnings[0].line).toBe(3)
})

test('should count unique text-shadows across the entire stylesheet', async () => {
	const { warnings, errored } = await lint(
		`
		a { text-shadow: 1px 1px red; }
		b { text-shadow: 2px 2px blue; }
		c { text-shadow: 3px 3px green; }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 3 unique text shadows (1px 1px red, 2px 2px blue, 3px 3px green) which exceeds the maximum of 2 (projectwallace/max-unique-text-shadows)',
	)
	expect(warnings[0].line).toBe(4)
})

test('should count each same shadow value only once', async () => {
	const { warnings, errored } = await lint(
		`
		a { text-shadow: 1px 1px red; }
		b { text-shadow: 1px 1px red; }
		c { text-shadow: 1px 1px red; }
		`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count ignored shadows (string match)', async () => {
	const { warnings, errored } = await lint(
		`a { text-shadow: 1px 1px red; } b { text-shadow: 2px 2px blue; }`,
		1,
		{ ignore: ['1px 1px red'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support RegExp patterns in ignore', async () => {
	const { warnings, errored } = await lint(
		`a { text-shadow: 1px 1px red; } b { text-shadow: 2px 2px blue; } c { text-shadow: 3px 3px white; }`,
		1,
		{ ignore: [/^\d+px \d+px (red|blue)$/] },
	)
	// Only the white shadow is not ignored → 1 unique shadow
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// CSS keywords
// ---------------------------------------------------------------------------

test.each(['none', 'inherit', 'initial', 'unset', 'revert', 'revert-layer'])(
	'should not count %s as a unique text shadow',
	async (keyword) => {
		const { warnings, errored } = await lint(`a { text-shadow: ${keyword}; }`, 1)
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

test('should count design token shadows while ignoring keywords mixed in', async () => {
	const { warnings, errored } = await lint(
		`a { text-shadow: 1px 1px red; } b { text-shadow: none; } c { text-shadow: 2px 2px blue; }`,
		1,
	)
	// none is a keyword and is not counted → 2 unique shadows → exceeds limit of 1
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique text shadows (1px 1px red, 2px 2px blue) which exceeds the maximum of 1 (projectwallace/max-unique-text-shadows)',
	)
})
