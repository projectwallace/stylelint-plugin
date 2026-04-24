import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-unique-keyframes'

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
	const { warnings, errored } = await lint(`@keyframes foo {}`, -1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when 0 is configured and any keyframe is used', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {}`, 0)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('Found 1 unique keyframes')
	expect(warnings[0].text).toContain('exceeds the maximum of 0')
})

test('should not error when 0 is configured and no keyframe is used', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is a float', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {}`, 1.5)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when rule is disabled with null', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {}`, null)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no keyframes', async () => {
	const { warnings, errored } = await lint(`a { color: red; }`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unique keyframes are within the limit', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {} @keyframes bar {}`, 2)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same keyframe name is reused', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {} @keyframes foo {}`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when unique keyframes exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`@keyframes foo {} @keyframes bar {} @keyframes baz {}`,
		2,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({ rule: rule_name, severity: 'error' })
	expect(warnings[0].text).toContain('Found 3 unique keyframes')
	expect(warnings[0].text).toContain('exceeds the maximum of 2')
})

test('should error at the at-rule level', async () => {
	const { warnings } = await lint(
		`
		@keyframes foo {}
		@keyframes bar {}
		`,
		1,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(3)
})

test('should treat different keyframe names as different unique entries', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {} @keyframes FOO {}`, 1)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique keyframes')
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should not count an exact string match in ignore', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {} @keyframes bar {}`, 1, {
		ignore: ['foo'],
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count values matching a RegExp in ignore', async () => {
	const { warnings, errored } = await lint(
		`@keyframes fade-in {} @keyframes fade-out {} @keyframes slide-in {}`,
		1,
		{ ignore: [/fade/] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Vendor-prefixed keyframes
// ---------------------------------------------------------------------------

test('should not count vendor-prefixed @-webkit-keyframes', async () => {
	const { warnings, errored } = await lint(`@-webkit-keyframes foo {}`, 0)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not count vendor-prefixed keyframes alongside regular keyframes', async () => {
	const { warnings, errored } = await lint(`@keyframes foo {} @-webkit-keyframes foo {}`, 1)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should only count unprefixed keyframes when both are present', async () => {
	const { warnings, errored } = await lint(
		`@keyframes foo {} @-webkit-keyframes foo {} @keyframes bar {}`,
		1,
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique keyframes')
})

// ---------------------------------------------------------------------------
// ignore secondary option
// ---------------------------------------------------------------------------

test('should error when non-ignored values exceed the limit', async () => {
	const { warnings, errored } = await lint(
		`@keyframes foo {} @keyframes bar {} @keyframes baz {}`,
		1,
		{ ignore: ['foo'] },
	)
	expect(errored).toBe(true)
	expect(warnings[0].text).toContain('Found 2 unique keyframes')
})
