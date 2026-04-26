import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-media-queries'

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
	const { warnings, errored } = await lint(`@media (max-width: 768px) {}`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when 0 is configured and any media query is used', async () => {
	const { warnings, errored } = await lint(`@media (max-width: 768px) {}`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		'Found 1 unique media queries ((max-width: 768px)) which exceeds the maximum of 0 (projectwallace/max-unique-media-queries)',
	)
})

test('should not error when 0 is configured and no media query is used', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`@media (max-width: 768px) {}`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`@media (max-width: 768px) {}`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no media queries', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique queries are within the limit', async () => {
	const { warnings, errored } = await lint(
		`@media (max-width: 768px) {} @media (min-width: 1024px) {}`,
		2,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same query is reused', async () => {
	const { warnings, errored } = await lint(
		`@media (max-width: 768px) {} @media (max-width: 768px) {}`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique queries exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`@media (max-width: 768px) {} @media (min-width: 1024px) {} @media (min-width: 1440px) {}`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toBe(
		'Found 3 unique media queries ((max-width: 768px), (min-width: 1024px), (min-width: 1440px)) which exceeds the maximum of 2 (projectwallace/max-unique-media-queries)',
	)
})

test('should error at the at-rule level', async () => {
	const { warnings } = await lint(
		`
		@media (max-width: 768px) {}
		@media (min-width: 1024px) {}
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

test('should treat different query strings as different unique entries', async () => {
	const { warnings, errored } = await lint(
		`@media (max-width: 768px) {} @media screen and (max-width: 768px) {}`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique media queries ((max-width: 768px), screen and (max-width: 768px)) which exceeds the maximum of 1 (projectwallace/max-unique-media-queries)',
	)
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count an exact string match in ignore', async () => {
	const { warnings, errored } = await lint(
		`@media (max-width: 768px) {} @media (min-width: 1024px) {}`,
		1,
		{ ignore: ['(max-width: 768px)'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(
		`@media (max-width: 768px) {} @media (min-width: 1024px) {} @media (min-width: 1440px) {}`,
		1,
		{ ignore: [/min-width/] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when non-ignored values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`@media (max-width: 768px) {} @media (min-width: 1024px) {} @media (min-width: 1440px) {}`,
		1,
		{ ignore: ['(max-width: 768px)'] },
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toBe(
		'Found 2 unique media queries ((min-width: 1024px), (min-width: 1440px)) which exceeds the maximum of 1 (projectwallace/max-unique-media-queries)',
	)
})
