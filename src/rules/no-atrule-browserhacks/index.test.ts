import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-atrule-browserhacks'

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

test('should not run when option is invalid', async () => {
	const { errored } = await lint('a { color: red }', false)
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error on a normal @media query', async () => {
	const { warnings, errored } = await lint('@media (min-width: 768px) {}', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a normal @supports query', async () => {
	const { warnings, errored } = await lint('@supports (display: grid) {}', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on other at-rules', async () => {
	const { warnings, errored } = await lint('@keyframes foo {}', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation — @media browserhacks
// ---------------------------------------------------------------------------

test('should error on @media with \\0 media type browserhack', async () => {
	const { warnings, errored } = await lint('@media \\0screen {}', true)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toContain(rule_name)
	expect(text).toContain('\\0')
})

test('should error on @media with -moz-images-in-menus feature browserhack', async () => {
	const { warnings, errored } = await lint('@media (-moz-images-in-menus: 0) {}', true)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toContain(rule_name)
	expect(text).toContain('-moz-images-in-menus')
})

test('should error on @media with min--moz-device-pixel-ratio browserhack', async () => {
	const { warnings, errored } = await lint('@media (min--moz-device-pixel-ratio: 0) {}', true)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toContain(rule_name)
	expect(text).toContain('min--moz-device-pixel-ratio')
})

// ---------------------------------------------------------------------------
// Violation — @supports browserhacks
// ---------------------------------------------------------------------------

test('should error on @supports with -webkit-appearance: none browserhack', async () => {
	const { warnings, errored } = await lint('@supports (-webkit-appearance: none) {}', true)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toContain(rule_name)
	expect(text).toContain('-webkit-appearance')
})

test('should error on @supports with -moz-appearance: meterbar browserhack', async () => {
	const { warnings, errored } = await lint('@supports (-moz-appearance: meterbar) {}', true)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toContain(rule_name)
	expect(text).toContain('-moz-appearance')
})
