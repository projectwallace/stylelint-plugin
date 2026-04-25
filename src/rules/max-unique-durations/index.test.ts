import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-durations'

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
	const { warnings, errored } = await lint(`a { animation-duration: 1s; }`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`a { animation-duration: 1s; }`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { animation-duration: 1s; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation — basic cases
// ---------------------------------------------------------------------------

test('should not error when there are no durations', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique durations are within the limit', async () => {
	const { warnings, errored } = await lint(
		`a { animation-duration: 1s; } b { animation-duration: 2s; }`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same duration is reused', async () => {
	const { warnings, errored } = await lint(
		`a { animation-duration: 1s; } b { animation-duration: 1s; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique durations exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-duration: 1s; }
		b { animation-duration: 2s; }
		c { animation-duration: 3s; }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toContain('Found 3 unique durations')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
	expect(warnings[0].line).toBe(4)
})

test('should error at the declaration level', async () => {
	const { warnings } = await lint(
		`
		a { animation-duration: 1s; }
		b { animation-duration: 2s; }
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

// ---------------------------------------------------------------------------
// animation-duration property
// ---------------------------------------------------------------------------

test('should count a single animation-duration', async () => {
	const { warnings, errored } = await lint(`a { animation-duration: 1s; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count comma-separated animation-duration values as separate durations', async () => {
	const { warnings, errored } = await lint(`a { animation-duration: 1s, 2s; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique durations')
})

test('should not double-count repeated values in animation-duration list', async () => {
	const { warnings, errored } = await lint(`a { animation-duration: 1s, 1s; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// transition-duration property
// ---------------------------------------------------------------------------

test('should count a single transition-duration', async () => {
	const { warnings, errored } = await lint(`a { transition-duration: 200ms; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count comma-separated transition-duration values as separate durations', async () => {
	const { warnings, errored } = await lint(`a { transition-duration: 100ms, 200ms; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique durations')
})

// ---------------------------------------------------------------------------
// animation shorthand property
// ---------------------------------------------------------------------------

test('should count duration from animation shorthand', async () => {
	const { warnings, errored } = await lint(`a { animation: slide 1s ease infinite; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when animation shorthand introduces a new unique duration', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-duration: 1s; }
		b { animation: slide 2s ease; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique durations')
})

// ---------------------------------------------------------------------------
// transition shorthand property
// ---------------------------------------------------------------------------

test('should count duration from transition shorthand', async () => {
	const { warnings, errored } = await lint(`a { transition: opacity 300ms ease; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when transition shorthand introduces a new unique duration', async () => {
	const { warnings, errored } = await lint(
		`
		a { transition-duration: 100ms; }
		b { transition: opacity 300ms ease; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique durations')
})

// ---------------------------------------------------------------------------
// Cross-property uniqueness
// ---------------------------------------------------------------------------

test('should count durations across animation-duration and transition-duration', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-duration: 1s; }
		b { transition-duration: 2s; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique durations')
})

test('should deduplicate the same duration across different properties', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-duration: 1s; }
		b { transition-duration: 1s; }
		`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count ignored durations (string match)', async () => {
	const { warnings, errored } = await lint(
		`a { animation-duration: 1s; } b { animation-duration: 2s; }`,
		1,
		{ ignore: ['1s'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support RegExp patterns in ignore', async () => {
	const { warnings, errored } = await lint(
		`a { animation-duration: 100ms; } b { animation-duration: 200ms; } c { animation-duration: 1s; }`,
		1,
		{ ignore: [/^\d+ms$/] },
	)
	// Only 1s is not ignored → 1 unique duration
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// CSS keywords
// ---------------------------------------------------------------------------

test.each(['inherit', 'initial', 'unset', 'revert', 'revert-layer'])(
	'should not count %s as a unique duration',
	async (keyword) => {
		const { warnings, errored } = await lint(`a { animation-duration: ${keyword}; }`, 1)
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

test('should count design token durations while ignoring keywords mixed in', async () => {
	const { warnings, errored } = await lint(
		`a { animation-duration: 1s; } b { animation-duration: inherit; } c { animation-duration: 2s; }`,
		1,
	)
	// inherit is a keyword and is not counted → 1s + 2s = 2 → exceeds limit of 1
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique durations')
})
