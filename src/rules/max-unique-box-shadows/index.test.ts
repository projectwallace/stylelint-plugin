import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-box-shadows'

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
	const { errored } = await lint(`a { box-shadow: 0 2px 4px red; }`, -1)
	expect(errored).toBe(true)
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(`a { box-shadow: 0 2px 4px red; }`, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: 0 2px 4px red; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation — basic cases
// ---------------------------------------------------------------------------

test('should not error when there are no box-shadows', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique box-shadows are within the limit', async () => {
	const { warnings, errored } = await lint(
		`a { box-shadow: 0 2px 4px red; } b { box-shadow: 0 4px 8px blue; }`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same box-shadow is reused', async () => {
	const { warnings, errored } = await lint(
		`a { box-shadow: 0 2px 4px red; } b { box-shadow: 0 2px 4px red; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for box-shadow: none', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: none; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique box-shadows exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`
		a { box-shadow: 0 2px 4px red; }
		b { box-shadow: 0 4px 8px blue; }
		c { box-shadow: 0 8px 16px green; }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toBe(
		'Found 3 unique box shadows (0 2px 4px red, 0 4px 8px blue, 0 8px 16px green) which exceeds the maximum of 2 (projectwallace/max-unique-box-shadows)',
	)
	expect(warnings[0].line).toBe(4)
})

test('should error at the declaration level', async () => {
	const { warnings } = await lint(
		`
		a { box-shadow: 0 2px 4px red; }
		b { box-shadow: 0 4px 8px blue; }
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
	const { warnings, errored } = await lint(`a { box-shadow: 2px 4px red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect a shadow with blur radius', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: 0 2px 4px red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect a shadow with spread radius', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: 0 2px 4px 1px red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect an inset shadow', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: inset 0 1px 0 white; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect a multi-layer shadow as a single unique value', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: 0 2px 4px red, 0 1px 2px blue; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Uniqueness
// ---------------------------------------------------------------------------

test('should treat different shadow values as different unique shadows', async () => {
	const { warnings, errored } = await lint(
		`
		a { box-shadow: 0 2px 4px red; }
		b { box-shadow: 0 4px 8px red; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique box shadows (0 2px 4px red, 0 4px 8px red) which exceeds the maximum of 1 (projectwallace/max-unique-box-shadows)',
	)
	expect(warnings[0].line).toBe(3)
})

test('should count unique box-shadows across the entire stylesheet', async () => {
	const { warnings, errored } = await lint(
		`
		a { box-shadow: 0 2px 4px red; }
		b { box-shadow: 0 4px 8px blue; }
		c { box-shadow: 0 8px 16px green; }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 3 unique box shadows (0 2px 4px red, 0 4px 8px blue, 0 8px 16px green) which exceeds the maximum of 2 (projectwallace/max-unique-box-shadows)',
	)
	expect(warnings[0].line).toBe(4)
})

test('should count each same shadow value only once', async () => {
	const { warnings, errored } = await lint(
		`
		a { box-shadow: 0 2px 4px red; }
		b { box-shadow: 0 2px 4px red; }
		c { box-shadow: 0 2px 4px red; }
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
		`a { box-shadow: 0 2px 4px red; } b { box-shadow: 0 4px 8px blue; }`,
		1,
		{ ignore: ['0 2px 4px red'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support RegExp patterns in ignore', async () => {
	const { warnings, errored } = await lint(
		`a { box-shadow: 0 2px 4px red; } b { box-shadow: 0 4px 8px blue; } c { box-shadow: inset 0 1px 0 white; }`,
		1,
		{ ignore: [/^0 \d+px \d+px (red|blue)$/] },
	)
	// Only inset shadow is not ignored → 1 unique shadow
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// CSS keywords
// ---------------------------------------------------------------------------

test.each(['none', 'inherit', 'initial', 'unset', 'revert', 'revert-layer'])(
	'should not count %s as a unique box shadow',
	async (keyword) => {
		const { warnings, errored } = await lint(`a { box-shadow: ${keyword}; }`, 1)
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

test('should count design token shadows while ignoring keywords mixed in', async () => {
	const { warnings, errored } = await lint(
		`a { box-shadow: 0 2px 4px red; } b { box-shadow: none; } c { box-shadow: 0 4px 8px blue; }`,
		1,
	)
	// none is a keyword and is not counted → 2 unique shadows → exceeds limit of 1
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique box shadows (0 2px 4px red, 0 4px 8px blue) which exceeds the maximum of 1 (projectwallace/max-unique-box-shadows)',
	)
})
