import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-colors'

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
	// -1 passes the Number type check but fails the > 0 guard → no lint errors
	const { warnings, errored } = await lint(`a { color: red; }`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation — basic cases
// ---------------------------------------------------------------------------

test('should not error when there are no colors', async () => {
	const { warnings, errored } = await lint(`a { font-size: 16px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique colors are within the limit', async () => {
	const { warnings, errored } = await lint(`a { color: red; background-color: blue; }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same named color is reused', async () => {
	const { warnings, errored } = await lint(
		`a { color: red; } b { background-color: red; border-color: red; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same hex color is reused', async () => {
	const { warnings, errored } = await lint(`a { color: #fff; } b { background-color: #fff; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique colors exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`a { color: red; background-color: blue; border-color: green; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toBe(
		'Found 3 unique colors (red, blue, green) which exceeds the maximum of 2 (projectwallace/max-unique-colors)',
	)
})

test('should error at the declaration level', async () => {
	const { warnings } = await lint(
		`
		a { color: red; }
		b { color: blue; }
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

// ---------------------------------------------------------------------------
// Named colors (case-insensitivity of detection, case-sensitivity for uniqueness)
// ---------------------------------------------------------------------------

test('should recognise named colors case-insensitively as colors', async () => {
	// Both 'Red' and 'RED' are detected as named colors, but kept as-is for uniqueness
	const { warnings, errored } = await lint(`a { color: Red; } b { color: RED; }`, 1)
	// Red ≠ RED → 2 unique colors → violation
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (Red, RED) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should treat the same color casing as one unique color', async () => {
	const { warnings, errored } = await lint(`a { color: red; } b { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise transparent as a color', async () => {
	const { warnings, errored } = await lint(`a { background-color: transparent; color: red; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (transparent, red) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should recognise currentColor as a color', async () => {
	const { warnings, errored } = await lint(`a { border-color: currentColor; color: red; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (currentColor, red) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

// ---------------------------------------------------------------------------
// Hex colors
// ---------------------------------------------------------------------------

test('should recognise 3-digit hex colors', async () => {
	const { warnings, errored } = await lint(`a { color: #f00; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise 4-digit hex colors (with alpha)', async () => {
	const { warnings, errored } = await lint(`a { color: #f00f; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise 6-digit hex colors', async () => {
	const { warnings, errored } = await lint(`a { color: #ff0000; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise 8-digit hex colors (with alpha)', async () => {
	const { warnings, errored } = await lint(`a { color: #ff000080; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should treat different hex strings as different unique colors', async () => {
	// #f00 and #ff0000 both visually represent red but are different strings
	const { warnings, errored } = await lint(`a { color: #f00; background-color: #ff0000; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (#f00, #ff0000) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should preserve hex casing for uniqueness', async () => {
	// #FFF and #fff are treated as different values
	const { warnings, errored } = await lint(`a { color: #FFF; } b { color: #fff; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (#FFF, #fff) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

// ---------------------------------------------------------------------------
// Color functions
// ---------------------------------------------------------------------------

test('should recognise rgb() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: rgb(255, 0, 0); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise rgba() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: rgba(255, 0, 0, 0.5); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise hsl() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: hsl(120deg 100% 50%); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise hsla() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: hsla(120deg 100% 50% / 0.5); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise hwb() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: hwb(120 0% 0%); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise lab() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: lab(50% 40 59); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise lch() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: lch(50% 73 39); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise oklab() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: oklab(0.5 0.1 -0.1); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise oklch() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: oklch(0.5 0.2 120); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise color() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: color(display-p3 1 0 0); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise color-mix() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: color-mix(in srgb, #fff 50%, #000); }`, 1)
	// color-mix() counts as 1 unique color; inner #fff and #000 are NOT counted separately
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should recognise light-dark() as a color', async () => {
	const { warnings, errored } = await lint(`a { color: light-dark(white, black); }`, 1)
	// light-dark() counts as 1 unique color; white and black inside are NOT counted separately
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Colors in shorthand and gradient properties
// ---------------------------------------------------------------------------

test('should detect colors in background shorthand', async () => {
	const { warnings, errored } = await lint(`a { background: red url(img.png) no-repeat; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect colors in border shorthand', async () => {
	const { warnings, errored } = await lint(`a { border: 1px solid blue; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect colors in box-shadow', async () => {
	const { warnings, errored } = await lint(`a { box-shadow: 0 0 10px red, 0 0 20px blue; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (red, blue) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should detect colors in text-shadow', async () => {
	const { warnings, errored } = await lint(`a { text-shadow: 1px 1px 2px black; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect named colors inside linear-gradient()', async () => {
	const { warnings, errored } = await lint(`a { background-image: linear-gradient(red, blue); }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (red, blue) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should detect hex colors inside radial-gradient()', async () => {
	const { warnings, errored } = await lint(
		`a { background-image: radial-gradient(#fff, #000); }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (#fff, #000) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should detect colors in SVG fill property', async () => {
	const { warnings, errored } = await lint(`circle { fill: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should detect colors in SVG stroke property', async () => {
	const { warnings, errored } = await lint(`circle { stroke: blue; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count non-color properties', async () => {
	// font-size, margin, padding etc. should not contribute to color count
	const { warnings, errored } = await lint(`a { font-size: 16px; margin: 0; padding: 10px; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// var() — without @property
// ---------------------------------------------------------------------------

test('should not count var() when the custom property is not @property <color>', async () => {
	// Without @property, we cannot know whether the var() is a color
	const { warnings, errored } = await lint(`a { color: var(--my-color); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count named-color fallback inside var() even without @property', async () => {
	const { warnings, errored } = await lint(`a { color: var(--undefined, red); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count multiple fallback colors from different var() declarations', async () => {
	const { warnings, errored } = await lint(
		`a { color: var(--a, red); background-color: var(--b, blue); }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (red, blue) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should count hex fallback inside var() without @property', async () => {
	const { warnings, errored } = await lint(`a { color: var(--unknown, #ff0000); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count color-function fallback inside var() without @property', async () => {
	const { warnings, errored } = await lint(`a { color: var(--unknown, rgb(255, 0, 0)); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count named color from nested var() fallback', async () => {
	// var(--a, var(--b, blue)) — blue is the deepest fallback
	const { warnings, errored } = await lint(`a { color: var(--a, var(--b, blue)); }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// var() — with @property { syntax: '<color>' }
// ---------------------------------------------------------------------------

test('should count the @property initial-value as a unique color', async () => {
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: red;
		}
	`
	// initial-value "red" counts even without any var() usage
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count initial-value AND usages together', async () => {
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: red;
		}
		a { color: blue; }
	`
	// "red" (initial-value) + "blue" (declaration) = 2 unique colors
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (red, blue) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should not count initial-value for non-color @property', async () => {
	const code = `
		@property --size {
			syntax: '<length>';
			inherits: false;
			initial-value: 0px;
		}
	`
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count initial-value with hex color', async () => {
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: #ff0000;
		}
		a { color: blue; }
	`
	// "#ff0000" + "blue" = 2 unique colors
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (#ff0000, blue) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should count var() referencing a @property <color> custom property', async () => {
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: red;
		}
		a { color: var(--brand-color); }
	`
	// "red" (initial-value) + "var(--brand-color)" = 2 unique colors
	const { warnings, errored } = await lint(code, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count var() as a unique color when it is a @property <color>', async () => {
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: red;
		}
		@property --accent-color {
			syntax: '<color>';
			inherits: false;
			initial-value: blue;
		}
		a { color: var(--brand-color); }
		b { color: var(--accent-color); }
	`
	// "red" + "blue" (initial-values) + "var(--brand-color)" + "var(--accent-color)" = 4 unique colors
	// Each violating declaration gets its own warning; the last one reflects the full count.
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 4 unique colors (red, blue, var(--brand-color), var(--accent-color)) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should count the var() expression AND fallback colors separately', async () => {
	// var(--brand-color, red): the var() is 1 color; "red" fallback is another
	const code = `
		@property --brand-color {
			syntax: '<color>';
			inherits: false;
			initial-value: blue;
		}
		a { color: var(--brand-color, red); }
	`
	// "blue" (initial-value) + "var(--brand-color, red)" + "red" (fallback) = 3 unique colors
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 3 unique colors (blue, var(--brand-color, red), red) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

test('should not count var() of a @property that does not have syntax <color>', async () => {
	const code = `
		@property --size {
			syntax: '<length>';
			inherits: false;
			initial-value: 0px;
		}
		a { width: var(--size); }
	`
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should handle @property with single-quoted syntax value', async () => {
	const code = `
		@property --brand {
			syntax: '<color>';
			inherits: true;
			initial-value: #000;
		}
		a { color: var(--brand); }
		b { color: var(--brand); }
	`
	// "#000" (initial-value) + "var(--brand)" (used twice but same string → 1) = 2 unique colors
	const { warnings, errored } = await lint(code, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count ignored named colors', async () => {
	const { warnings, errored } = await lint(`a { color: red; background-color: blue; }`, 1, {
		ignore: ['red'],
	})
	// Only blue is counted → within limit
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count ignored hex colors', async () => {
	const { warnings, errored } = await lint(`a { color: #fff; background-color: #000; }`, 1, {
		ignore: ['#fff'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support RegExp patterns in ignore', async () => {
	const { warnings, errored } = await lint(
		`a { color: red; background-color: blue; border-color: green; }`,
		1,
		{ ignore: [/^(red|blue)$/] },
	)
	// Only green is not ignored → 1 unique color
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support ignoring transparent', async () => {
	const { warnings, errored } = await lint(`a { color: red; background-color: transparent; }`, 1, {
		ignore: ['transparent'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support ignoring currentColor', async () => {
	const { warnings, errored } = await lint(`a { color: red; border-color: currentColor; }`, 1, {
		ignore: ['currentColor'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support ignoring color functions via RegExp', async () => {
	const { warnings, errored } = await lint(
		`a { color: red; background: linear-gradient(oklch(0.5 0.2 120), oklch(0.8 0.1 60)); }`,
		1,
		{ ignore: [/^oklch\(/] },
	)
	// oklch() expressions are ignored → only red counts
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Custom properties as color declarations
// ---------------------------------------------------------------------------

test('should detect colors declared in custom properties', async () => {
	const { warnings, errored } = await lint(`a { --text-color: red; --bg-color: blue; }`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique colors (red, blue) which exceeds the maximum of 1 (projectwallace/max-unique-colors)',
	)
})

// ---------------------------------------------------------------------------
// Multiple rules / selectors
// ---------------------------------------------------------------------------

test('should count unique colors across the entire stylesheet', async () => {
	const { warnings, errored } = await lint(
		`a { color: red; } b { color: blue; } c { color: green; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 3 unique colors (red, blue, green) which exceeds the maximum of 2 (projectwallace/max-unique-colors)',
	)
})

test('should count each same color expression only once across declarations', async () => {
	const { warnings, errored } = await lint(
		`
			a { color: oklch(0.5 0.2 120); }
			b { background-color: oklch(0.5 0.2 120); }
			c { border-color: oklch(0.5 0.2 120); }
		`,
		1,
	)
	// All three declarations use the same color string → 1 unique color
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
