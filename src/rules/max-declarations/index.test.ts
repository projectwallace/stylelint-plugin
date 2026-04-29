import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-declarations'

async function lint(code: string, primaryOption: unknown) {
	const {
		results: [result],
	} = await stylelint.lint({
		code,
		config: {
			plugins: [plugin],
			rules: { [rule_name]: primaryOption },
		},
	})
	return result
}

// ---------------------------------------------------------------------------
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when option is negative', async () => {
	const { errored } = await lint('a {}', -1)
	expect(errored).toBe(true)
})

test('should not run when option is a float', async () => {
	const { errored } = await lint('a {}', 1.5)
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when declaration count is within limit', async () => {
	const { warnings, errored } = await lint('a { color: red; }', 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are no declarations', async () => {
	const { warnings, errored } = await lint('a {}', 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when declaration count exceeds the limit', async () => {
	const code = `a { color: red; background: blue; }`
	const { warnings, errored } = await lint(code, 1)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
		text: `Counted 2 declarations which is greater than the allowed 1 (${rule_name})`,
	})
})

test('should error when count exceeds limit of 0', async () => {
	const { warnings, errored } = await lint('a { color: red; }', 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})
