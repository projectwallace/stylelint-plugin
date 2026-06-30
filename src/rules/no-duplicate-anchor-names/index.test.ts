import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-anchor-names'

async function lint(code: string) {
	const config = {
		plugins: [plugin],
		rules: { [rule_name]: true },
	}
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when an anchor name is used only once', async () => {
	const { warnings, errored } = await lint('.a { anchor-name: --my-anchor; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct anchor names are used', async () => {
	const { warnings, errored } = await lint('.a { anchor-name: --foo; } .b { anchor-name: --bar; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when anchor-name is none', async () => {
	const { warnings, errored } = await lint('.a { anchor-name: none; } .b { anchor-name: none; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct anchor names appear on one element', async () => {
	const { warnings, errored } = await lint('.a { anchor-name: --foo, --bar; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when the same anchor name is defined twice', async () => {
	const { warnings, errored } = await lint('.a { anchor-name: --foo; } .b { anchor-name: --foo; }')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate anchor name "--foo" (${rule_name})`,
	})
})

test('should error when a comma-separated list contains a previously defined name', async () => {
	const { warnings, errored } = await lint(
		'.a { anchor-name: --foo; } .b { anchor-name: --bar, --foo; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate anchor name "--foo" (${rule_name})`,
	})
})

test('should report on the correct line and column for a duplicate', async () => {
	const { warnings } = await lint(`.a { anchor-name: --foo; }
.b { anchor-name: --foo; }`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 19,
		endColumn: 24,
	})
})

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when the option is invalid', async () => {
	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: '.a { anchor-name: --foo; } .b { anchor-name: --foo; }',
		config: { plugins: [plugin], rules: { [rule_name]: 'invalid' } },
	})
	expect(errored).toBe(true)
})

test('should not run when the rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.a { anchor-name: --foo; } .b { anchor-name: --foo; }',
		config: { plugins: [plugin], rules: { [rule_name]: null } },
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
