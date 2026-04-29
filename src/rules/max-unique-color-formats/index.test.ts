import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-color-formats'

async function lint(code: string, primaryOption: unknown) {
	const {
		results: [result],
	} = await stylelint.lint({
		code,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: primaryOption,
			},
		},
	})
	return result
}

// ---------------------------------------------------------------------------
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when config is negative', async () => {
	const { errored } = await lint(`a { color: red; }`, -1)
	expect(errored).toBe(true)
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(`a { color: red; }`, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no colors', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when only one format is used (named)', async () => {
	const { warnings, errored } = await lint(
		`a { color: red; } b { color: blue; } c { color: green; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when only one format is used (hex)', async () => {
	const { warnings, errored } = await lint(
		`a { color: #f00; } b { color: #00f; } c { color: #0f0; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when only one format is used (hsl)', async () => {
	const { warnings, errored } = await lint(
		`
		.a { color: hsl(0, 100%, 50%); }
		.b { color: hsl(240, 100%, 50%); }
		.c { color: hsl(120, 25%, 25%); }
		.d { color: hsl(60, 100%, 50%); }
		`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when formats are within the limit', async () => {
	const { warnings, errored } = await lint(`a { color: red; } b { color: #00f; }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when formats exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`
		.a { color: red; }
		.b { color: #00f; }
		.c { color: rgb(0, 128, 0); }
		.d { color: hsl(60, 100%, 50%); }
		`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
})

test('should error with the correct message', async () => {
	const { warnings, errored } = await lint(`a { color: red; background-color: #00f; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (named, hex) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

test('should error at the declaration level', async () => {
	const { warnings } = await lint(
		`
		a { color: red; }
		b { color: #00f; }
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

// ---------------------------------------------------------------------------
// Format detection — each CSS color format
// ---------------------------------------------------------------------------

test.each([
	['hex (3-digit)', `a { color: #f00; }`, 'hex'],
	['hex (6-digit)', `a { color: #ff0000; }`, 'hex'],
	['hex (8-digit with alpha)', `a { color: #ff000080; }`, 'hex'],
	['named color', `a { color: red; }`, 'named'],
	['transparent', `a { color: transparent; }`, 'named'],
	['rgb', `a { color: rgb(255, 0, 0); }`, 'rgb'],
	['rgba', `a { color: rgba(255, 0, 0, 0.5); }`, 'rgba'],
	['hsl', `a { color: hsl(0, 100%, 50%); }`, 'hsl'],
	['hsla', `a { color: hsla(0, 100%, 50%, 0.5); }`, 'hsla'],
	['hwb', `a { color: hwb(0 0% 0%); }`, 'hwb'],
	['lab', `a { color: lab(50% 40 59); }`, 'lab'],
	['lch', `a { color: lch(50% 73 39); }`, 'lch'],
	['oklab', `a { color: oklab(0.5 0.1 -0.1); }`, 'oklab'],
	['oklch', `a { color: oklch(0.5 0.2 120); }`, 'oklch'],
	['color()', `a { color: color(display-p3 1 0 0); }`, 'color'],
	[
		'color-mix (both inner colors same format)',
		`a { color: color-mix(in srgb, #fff 50%, #000); }`,
		'hex',
	],
	['light-dark (both inner colors same format)', `a { color: light-dark(white, black); }`, 'named'],
])('should detect %s as 1 unique format', async (_label, code, _format) => {
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count rgb and rgba as different formats', async () => {
	const { warnings, errored } = await lint(
		`a { color: rgb(255, 0, 0); background-color: rgba(0, 0, 255, 0.5); }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (rgb, rgba) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

test('should count hsl and hsla as different formats', async () => {
	const { warnings, errored } = await lint(
		`a { color: hsl(0, 100%, 50%); background-color: hsla(0, 100%, 50%, 0.5); }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (hsl, hsla) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

test('should count unique formats across the entire stylesheet', async () => {
	const { errored } = await lint(
		`
		.a { color: red; }
		.b { color: #00f; }
		.c { color: rgb(0, 128, 0); }
		.d { color: hsl(60, 100%, 50%); }
		`,
		3,
	)
	expect(errored).toBe(true)
})

test('should count the same format only once across declarations', async () => {
	const { warnings, errored } = await lint(
		`
		a { color: oklch(0.5 0.2 120); }
		b { background-color: oklch(0.8 0.1 60); }
		c { border-color: oklch(0.3 0.3 240); }
		`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// color-mix / light-dark (composing functions)
// ---------------------------------------------------------------------------

test('should detect inner color formats of color-mix, not color-mix itself', async () => {
	const { warnings, errored } = await lint(`a { color: color-mix(in srgb, #fff 50%, #000); }`, 1)
	// inner #fff and #000 are both hex → 1 unique format
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect inner color formats of light-dark, not light-dark itself', async () => {
	const { warnings, errored } = await lint(`a { color: light-dark(white, black); }`, 1)
	// white and black are both named → 1 unique format
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect mixed formats inside color-mix', async () => {
	const { warnings, errored } = await lint(`a { color: color-mix(in srgb, red 50%, #000); }`, 1)
	// red → named, #000 → hex = 2 unique formats
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (named, hex) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

test('should detect mixed formats inside light-dark', async () => {
	const { warnings, errored } = await lint(`a { color: light-dark(white, #000); }`, 1)
	// white → named, #000 → hex = 2 unique formats
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (named, hex) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

// ---------------------------------------------------------------------------
// var() — @property <color>
// ---------------------------------------------------------------------------

test('should count var() as the "var" format when referencing an @property <color>', async () => {
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: red;
		}
		a { color: var(--brand-color); }
	`
	// initial-value "red" → named; var(--brand-color) → var
	const { warnings, errored } = await lint(code, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count var() when the custom property is not @property <color>', async () => {
	const { warnings, errored } = await lint(`a { color: var(--my-color); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count format from @property initial-value', async () => {
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: #ff0000;
		}
		a { color: oklch(0.5 0.2 120); }
	`
	// initial-value "#ff0000" → hex; declaration → oklch = 2 formats
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (hex, oklch) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

// ---------------------------------------------------------------------------
// Colors in shorthand and gradient properties
// ---------------------------------------------------------------------------

test('should detect format in background shorthand', async () => {
	const { warnings, errored } = await lint(`a { background: red url(img.png) no-repeat; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect format in box-shadow', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: 0 0 10px red, 0 0 20px #00f; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (named, hex) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

test('should detect formats inside gradient functions', async () => {
	const { warnings, errored } = await lint(`a { background-image: linear-gradient(red, #00f); }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (named, hex) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

test('should detect formats in custom properties', async () => {
	const { warnings, errored } = await lint(`a { --text: red; --bg: #000; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique color formats (named, hex) which exceeds the maximum of 1 (projectwallace/max-unique-color-formats)',
	)
})

test('should not count non-color properties', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; margin: 0; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
