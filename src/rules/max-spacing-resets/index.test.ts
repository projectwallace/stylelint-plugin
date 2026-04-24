import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin, { rule_name } from './index.js'

async function lint(code: string, primaryOption: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: primaryOption,
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
	const { warnings, errored } = await lint(`a { margin: 0; }`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`a { margin: 0; }`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { margin: 0; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no spacing resets', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when resets are within the limit', async () => {
	const { warnings, errored } = await lint(`a { margin: 0; } b { padding: 0; }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when 0 is configured and no resets are used', async () => {
	const { warnings, errored } = await lint(`a { margin: 1rem; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count non-zero spacing values', async () => {
	const { warnings, errored } = await lint(`a { margin: 1rem; padding: 16px; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count 0 on non-spacing properties', async () => {
	const { warnings, errored } = await lint(`a { width: 0; height: 0; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when 0 is configured and a reset is used', async () => {
	const { warnings, errored } = await lint(`a { margin: 0; }`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('Found 1 spacing resets')
	expect(warnings[0].text).toContain('exceeds the maximum of 0')
})

test('should error when limit is exceeded', async () => {
	const { warnings, errored } = await lint(
		`a { margin: 0; } b { padding: 0; } c { margin-top: 0; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('Found 3 spacing resets')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
})

test('should report each declaration that pushed count over limit', async () => {
	const { warnings, errored } = await lint(
		`a { margin: 0; } b { padding: 0; } c { margin-top: 0; } d { padding-bottom: 0; }`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

// ---------------------------------------------------------------------------
// Reset detection
// ---------------------------------------------------------------------------

test('should count margin: 0 as a reset', async () => {
	const { warnings } = await lint(`a { margin: 0; }`, 0)
	expect(warnings).toHaveLength(1)
})

test('should count padding: 0 as a reset', async () => {
	const { warnings } = await lint(`a { padding: 0; }`, 0)
	expect(warnings).toHaveLength(1)
})

test('should count margin: 0px as a reset', async () => {
	const { warnings } = await lint(`a { margin: 0px; }`, 0)
	expect(warnings).toHaveLength(1)
})

test('should count margin: 0 0 as a reset', async () => {
	const { warnings } = await lint(`a { margin: 0 0; }`, 0)
	expect(warnings).toHaveLength(1)
})

test('should count all spacing properties as resets', async () => {
	const css = [
		'a { margin: 0; }',
		'b { margin-top: 0; }',
		'c { margin-right: 0; }',
		'd { margin-bottom: 0; }',
		'e { margin-left: 0; }',
		'f { padding: 0; }',
		'g { padding-top: 0; }',
	].join(' ')
	const { warnings } = await lint(css, 6)
	expect(warnings).toHaveLength(1)
})
