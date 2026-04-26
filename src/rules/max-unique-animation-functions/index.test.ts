import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-animation-functions'

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
	const { errored } = await lint(`a { animation-timing-function: ease; }`, -1)
	expect(errored).toBe(true)
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(`a { animation-timing-function: ease; }`, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { animation-timing-function: ease; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation — basic cases
// ---------------------------------------------------------------------------

test('should not error when there are no animation functions', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique animation functions are within the limit', async () => {
	const { warnings, errored } = await lint(
		`a { animation-timing-function: ease; } b { animation-timing-function: linear; }`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same animation function is reused', async () => {
	const { warnings, errored } = await lint(
		`a { animation-timing-function: ease; } b { animation-timing-function: ease; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique animation functions exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-timing-function: ease; }
		b { animation-timing-function: linear; }
		c { animation-timing-function: ease-in; }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toContain('Found 3 unique animation-functions')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
	expect(warnings[0].line).toBe(4)
})

test('should error at the declaration level', async () => {
	const { warnings } = await lint(
		`
		a { animation-timing-function: ease; }
		b { animation-timing-function: linear; }
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

// ---------------------------------------------------------------------------
// animation-timing-function property
// ---------------------------------------------------------------------------

test('should count a single animation-timing-function', async () => {
	const { warnings, errored } = await lint(`a { animation-timing-function: ease; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count comma-separated animation-timing-function values as separate functions', async () => {
	const { warnings, errored } = await lint(`a { animation-timing-function: ease, linear; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique animation-functions')
})

test('should not double-count repeated values in animation-timing-function list', async () => {
	const { warnings, errored } = await lint(`a { animation-timing-function: ease, ease; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// transition-timing-function property
// ---------------------------------------------------------------------------

test('should count a single transition-timing-function', async () => {
	const { warnings, errored } = await lint(`a { transition-timing-function: ease; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count comma-separated transition-timing-function values as separate functions', async () => {
	const { warnings, errored } = await lint(`a { transition-timing-function: ease, linear; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique animation-functions')
})

// ---------------------------------------------------------------------------
// animation shorthand property
// ---------------------------------------------------------------------------

test('should count timing function from animation shorthand', async () => {
	const { warnings, errored } = await lint(`a { animation: slide 1s ease infinite; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when animation shorthand introduces a new unique timing function', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-timing-function: ease; }
		b { animation: slide 2s linear; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique animation-functions')
})

// ---------------------------------------------------------------------------
// transition shorthand property
// ---------------------------------------------------------------------------

test('should count timing function from transition shorthand', async () => {
	const { warnings, errored } = await lint(`a { transition: opacity 300ms ease; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when transition shorthand introduces a new unique timing function', async () => {
	const { warnings, errored } = await lint(
		`
		a { transition-timing-function: ease; }
		b { transition: opacity 300ms linear; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique animation-functions')
})

// ---------------------------------------------------------------------------
// Cross-property uniqueness
// ---------------------------------------------------------------------------

test('should count timing functions across animation-timing-function and transition-timing-function', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-timing-function: ease; }
		b { transition-timing-function: linear; }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique animation-functions')
})

test('should deduplicate the same timing function across different properties', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-timing-function: ease; }
		b { transition-timing-function: ease; }
		`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count ignored animation functions (string match)', async () => {
	const { warnings, errored } = await lint(
		`a { animation-timing-function: ease; } b { animation-timing-function: linear; }`,
		1,
		{ ignore: ['ease'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support RegExp patterns in ignore', async () => {
	const { warnings, errored } = await lint(
		`a { animation-timing-function: ease; } b { animation-timing-function: ease-in; } c { animation-timing-function: linear; }`,
		1,
		{ ignore: [/^ease/] },
	)
	// Only linear is not ignored → 1 unique animation function
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
