import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-container-names'

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

test('should not error when a container name is used only once', async () => {
	const { warnings, errored } = await lint('.a { container-name: sidebar; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct container names are used', async () => {
	const { warnings, errored } = await lint(
		'.a { container-name: sidebar; } .b { container-name: header; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when container-name is none', async () => {
	const { warnings, errored } = await lint(
		'.a { container-name: none; } .b { container-name: none; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for the container type after the slash', async () => {
	const { warnings, errored } = await lint(
		'.a { container: sidebar / inline-size; } .b { container: header / inline-size; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when the same container-name is defined twice', async () => {
	const { warnings, errored } = await lint(
		'.a { container-name: sidebar; } .b { container-name: sidebar; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate container name "sidebar" (${rule_name})`,
	})
})

test('should error when the same name is set via the container shorthand twice', async () => {
	const { warnings, errored } = await lint(
		'.a { container: main / inline-size; } .b { container: main / inline-size; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error when container-name and container shorthand define the same name', async () => {
	const { warnings, errored } = await lint(
		'.a { container-name: main; } .b { container: main / block-size; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should report on the correct line and column for a duplicate', async () => {
	const { warnings } = await lint(`.a { container-name: sidebar; }
.b { container-name: sidebar; }`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 22,
		endColumn: 29,
	})
})

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when the option is invalid', async () => {
	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: '.a { container-name: sidebar; } .b { container-name: sidebar; }',
		config: { plugins: [plugin], rules: { [rule_name]: 'invalid' } },
	})
	expect(errored).toBe(true)
})

test('should not run when the rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.a { container-name: sidebar; } .b { container-name: sidebar; }',
		config: { plugins: [plugin], rules: { [rule_name]: null } },
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
