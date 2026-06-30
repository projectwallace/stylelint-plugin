import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-registered-properties'

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

test('should not error when an @property is registered only once', async () => {
	const { warnings, errored } = await lint(
		'@property --color { syntax: "<color>"; inherits: false; initial-value: red; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct @property names are registered', async () => {
	const { warnings, errored } = await lint(
		'@property --foo { syntax: "*"; inherits: false; } @property --bar { syntax: "*"; inherits: false; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when the same @property name is registered twice', async () => {
	const { warnings, errored } = await lint(
		'@property --color { syntax: "*"; inherits: false; } @property --color { syntax: "*"; inherits: false; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate @property registration "--color" (${rule_name})`,
	})
})

test('should error when the same @property name is registered three times', async () => {
	const { warnings, errored } = await lint(
		'@property --x { syntax: "*"; inherits: false; } @property --x { syntax: "*"; inherits: false; } @property --x { syntax: "*"; inherits: false; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should report on the correct line and column for a duplicate', async () => {
	const { warnings } = await lint(`@property --foo { syntax: "*"; inherits: false; }
@property --foo { syntax: "*"; inherits: false; }`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 11,
		endColumn: 16,
	})
})

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when the option is invalid', async () => {
	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: '@property --foo { syntax: "*"; inherits: false; } @property --foo { syntax: "*"; inherits: false; }',
		config: { plugins: [plugin], rules: { [rule_name]: 'invalid' } },
	})
	expect(errored).toBe(true)
})

test('should not run when the rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@property --foo { syntax: "*"; inherits: false; } @property --foo { syntax: "*"; inherits: false; }',
		config: { plugins: [plugin], rules: { [rule_name]: null } },
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
