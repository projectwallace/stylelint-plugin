import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-prefixed-atrules'

async function lint(code: string, primaryOption: unknown, secondaryOptions?: unknown) {
	const {
		results: [result],
	} = await stylelint.lint({
		code,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]:
					secondaryOptions !== undefined ? [primaryOption, secondaryOptions] : primaryOption,
			},
		},
	})
	return result
}

// ---------------------------------------------------------------------------
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when option is invalid', async () => {
	const { errored } = await lint('@keyframes fade { from {} to {} }', false)
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error on standard @keyframes', async () => {
	const { warnings, errored } = await lint('@keyframes fade { from {} to {} }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on standard @media', async () => {
	const { warnings, errored } = await lint('@media (min-width: 768px) { a { color: red } }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @supports', async () => {
	const { warnings, errored } = await lint('@supports (display: grid) { a { color: red } }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when @-webkit-keyframes is used', async () => {
	const { warnings, errored } = await lint('@-webkit-keyframes fade { from {} to {} }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('-webkit-keyframes')
})

test('should error when @-moz-keyframes is used', async () => {
	const { warnings, errored } = await lint('@-moz-keyframes slide { from {} to {} }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('-moz-keyframes')
})

test('should error when @-ms-viewport is used', async () => {
	const { warnings, errored } = await lint('@-ms-viewport { width: device-width }', true)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('-ms-viewport')
})

// ---------------------------------------------------------------------------
// Ignore option
// ---------------------------------------------------------------------------

test('should not error when atrule matches ignore string', async () => {
	const { warnings, errored } = await lint('@-webkit-keyframes fade { from {} to {} }', true, {
		ignore: ['-webkit-keyframes'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when atrule matches ignore RegExp', async () => {
	const { warnings, errored } = await lint('@-webkit-keyframes fade { from {} to {} }', true, {
		ignore: [/-webkit-keyframes/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when atrule does not match ignore', async () => {
	const { warnings, errored } = await lint('@-moz-keyframes slide { from {} to {} }', true, {
		ignore: ['-webkit-keyframes'],
	})
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
