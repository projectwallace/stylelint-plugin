import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-nesting-depth'

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
	const { errored } = await lint(`.a { color: red; }`, -1)
	expect(errored).toBe(true)
})

test('should not run when config is a float', async () => {
	const { errored } = await lint(`.a { color: red; }`, 1.5)
	expect(errored).toBe(true)
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`.a { color: red; }`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there is no nesting', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when nesting is within the limit', async () => {
	const { warnings, errored } = await lint(`.sidebar { .nav-link { color: blue; } }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when @media nesting is within the limit', async () => {
	const { warnings, errored } = await lint(
		`@media (min-width: 600px) { .sidebar { color: blue; } }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when @supports nesting is within the limit', async () => {
	const { warnings, errored } = await lint(
		`@supports (display: grid) { .sidebar { color: blue; } }`,
		1,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when nesting exceeds the limit', async () => {
	const { warnings, errored } = await lint(`.page { .sidebar { .nav { color: blue; } } }`, 1)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toBe(`Nesting depth 2 exceeds maximum of 1 (${rule_name})`)
})

test('should report each violating node separately', async () => {
	const { warnings } = await lint(`.page { .sidebar { .nav { .link { color: blue; } } } }`, 1)
	expect(warnings).toHaveLength(2)
})

test('should error when at-rule nesting exceeds the limit', async () => {
	const { warnings, errored } = await lint(
		`@media (min-width: 600px) { @supports (display: grid) { .rule { color: blue; } } }`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(`Nesting depth 2 exceeds maximum of 1 (${rule_name})`)
})

test('should error when 0 is configured and any nesting is used', async () => {
	const { warnings, errored } = await lint(`.sidebar { .nav-link { color: blue; } }`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(`Nesting depth 1 exceeds maximum of 0 (${rule_name})`)
})

test('should report violation at the rule level', async () => {
	const { warnings } = await lint(
		`
		.page {
			.sidebar {
				.nav { color: blue; }
			}
		}
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(4)
})
