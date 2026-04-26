import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-z-indexes'

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
// Option validation
// ---------------------------------------------------------------------------

test('should not run when config is negative', async () => {
	const { errored } = await lint(`a { z-index: 1; }`, -1)
	expect(errored).toBe(true)
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(`a { z-index: 1; }`, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`a { z-index: 1; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no z-index declarations', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique z-indexes are within the limit', async () => {
	const { warnings, errored } = await lint(`a { z-index: 1; } b { z-index: 2; }`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same z-index value is reused', async () => {
	const { warnings, errored } = await lint(
		`a { z-index: 10; } b { z-index: 10; } c { z-index: 10; }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count keyword values like auto', async () => {
	const { warnings, errored } = await lint(`a { z-index: auto; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count var() references', async () => {
	const { warnings, errored } = await lint(`a { z-index: var(--z-modal); }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when unique z-indexes exceed the limit', async () => {
	const { warnings } = await lint(`a { z-index: 1; } b { z-index: 2; }`, 1)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Found 2 unique z-indexes (1, 2) which exceeds the maximum of 1 (projectwallace/max-unique-z-indexes)`,
	)
})

test('should report on the declaration that pushed over the limit', async () => {
	const { warnings } = await lint(`a { z-index: 1; } b { z-index: 2; } c { z-index: 3; }`, 2)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Found 3 unique z-indexes (1, 2, 3) which exceeds the maximum of 2 (projectwallace/max-unique-z-indexes)`,
	)
})

test('should report all declarations that individually pushed over the limit', async () => {
	const { warnings } = await lint(
		`a { z-index: 1; } b { z-index: 2; } c { z-index: 3; } d { z-index: 4; }`,
		2,
	)
	expect(warnings).toHaveLength(2)
})

test('should report negative z-index values as unique', async () => {
	const { warnings } = await lint(`a { z-index: 1; } b { z-index: -1; }`, 1)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Found 2 unique z-indexes (1, -1) which exceeds the maximum of 1 (projectwallace/max-unique-z-indexes)`,
	)
})

// ---------------------------------------------------------------------------
// ignore option
// ---------------------------------------------------------------------------

test('should not count ignored values', async () => {
	const { warnings, errored } = await lint(`a { z-index: 9999; } b { z-index: 1; }`, 1, {
		ignore: ['9999'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching an ignore regex', async () => {
	const { warnings, errored } = await lint(`a { z-index: 100; } b { z-index: 200; }`, 1, {
		ignore: [/^[12]00$/],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
