import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-gradients'

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
	const { warnings, errored } = await lint(
		`a { background-image: linear-gradient(red, blue); }`,
		-1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: linear-gradient(red, blue); }`,
		1.5,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: linear-gradient(red, blue); }`,
		null,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation — basic cases
// ---------------------------------------------------------------------------

test('should not error when there are no gradients', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique gradients are within the limit', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: linear-gradient(red, blue); background: conic-gradient(red, blue); }`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same gradient is reused', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: linear-gradient(red, blue); } b { background-image: linear-gradient(red, blue); }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique gradients exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`
		a { background-image: linear-gradient(red, blue); }
		b { background-image: conic-gradient(red, blue); }
		c { background-image: linear-gradient(green, blue); }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toContain('Found 3 unique gradients')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
	expect(warnings[0].line).toBe(4)
})

// ---------------------------------------------------------------------------
// Gradient types
// ---------------------------------------------------------------------------

test('should recognise linear-gradient()', async () => {
	const { warnings, errored } = await lint(`a { background-image: linear-gradient(red, blue); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise conic-gradient()', async () => {
	const { warnings, errored } = await lint(`a { background-image: conic-gradient(red, blue); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise repeating-linear-gradient()', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: repeating-linear-gradient(red, blue); }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise repeating-conic-gradient()', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: repeating-conic-gradient(red, blue); }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise radial-gradient()', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: radial-gradient(circle, red, blue); }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise repeating-radial-gradient()', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: repeating-radial-gradient(circle, red, blue); }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

test('should detect gradients in background-image', async () => {
	const { warnings, errored } = await lint(`a { background-image: linear-gradient(red, blue); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect gradients in background shorthand', async () => {
	const { warnings, errored } = await lint(
		`a { background: linear-gradient(red, blue) no-repeat center; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not detect gradients in non-background properties', async () => {
	// content property can technically have gradient-like values in theory,
	// but the rule only checks background and background-image
	const { warnings, errored } = await lint(`a { color: red; font-size: 16px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Uniqueness
// ---------------------------------------------------------------------------

test('should treat different gradient expressions as different unique gradients', async () => {
	const { warnings, errored } = await lint(
		`
		a { background-image: linear-gradient(red, blue); }
		b { background-image: linear-gradient(blue, red); }
		`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique gradients')
	expect(warnings[0].text).toContain('exceeds the maximum of 1')
	expect(warnings[0].line).toBe(3)
})

test('should count unique gradients across the entire stylesheet', async () => {
	const { warnings, errored } = await lint(
		`
		a { background-image: linear-gradient(red, blue); }
		b { background-image: conic-gradient(red, blue); }
		c { background-image: repeating-linear-gradient(red, blue); }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 3 unique gradients')
	expect(warnings[0].line).toBe(4)
})

test('should count each same gradient expression only once', async () => {
	const { warnings, errored } = await lint(
		`
			a { background-image: linear-gradient(red, blue); }
			b { background-image: linear-gradient(red, blue); }
			c { background-image: linear-gradient(red, blue); }
		`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count ignored gradients (string match)', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: linear-gradient(red, blue); } b { background-image: conic-gradient(red, blue); }`,
		1,
		{ ignore: ['linear-gradient(red, blue)'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support RegExp patterns in ignore', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: linear-gradient(red, blue); } b { background-image: conic-gradient(red, blue); } c { background-image: repeating-linear-gradient(red, blue); }`,
		1,
		{ ignore: [/^(linear|conic)-gradient\(/] },
	)
	// Only repeating-linear-gradient is not ignored → 1 unique gradient
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
