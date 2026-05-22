import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unused-keyframes'

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
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when option is invalid', async () => {
	const { errored } = await lint('a {}', false)
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when keyframe is used in animation-name', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation-name: slide-in; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when quoted keyframe name is used in animation-name', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes "slide in" { from { opacity: 0; } to { opacity: 1; } }
		a { animation-name: "slide in"; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when quoted keyframe name is used in animation shorthand', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes "slide in" { from { opacity: 0; } to { opacity: 1; } }
		a { animation: "slide in" 1s ease; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when quoted keyframe name is never used', async () => {
	const { warnings, errored } = await lint(
		'@keyframes "slide in" { from { opacity: 0; } to { opacity: 1; } }',
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Keyframes ""slide in"" was declared but never used in an animation-name or animation (${rule_name})`,
	)
})

test('should not error when keyframe is used in animation shorthand', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation: slide-in 1s ease; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple keyframes are all used', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
		a { animation-name: slide-in, fade-out; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple keyframes are used in multiple animation shorthands', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
		a { animation: slide-in 1s, fade-out 2s; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are no keyframes', async () => {
	const { warnings, errored } = await lint('a { color: red; }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when animation-name is none', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-name: none; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when animation shorthand with only keyword values uses no keyframe name', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation: slide-in 1s ease forwards running; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when keyframe is used via animation shorthand with direction keywords', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } }
		a { animation: pulse 2s ease-in-out infinite alternate; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when ignore string matches unused keyframe name', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
		{ ignore: ['slide-in'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when ignore RegExp matches unused keyframe name', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
		{ ignore: [/^slide/] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when a keyframe is declared but never used', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Keyframes "slide-in" was declared but never used in an animation-name or animation (${rule_name})`,
	)
})

test('should error when one of multiple keyframes is unused', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
		a { animation-name: slide-in; }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Keyframes "fade-out" was declared but never used in an animation-name or animation (${rule_name})`,
	)
})

test('should error when animation-name is none and keyframe exists', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation-name: none; }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should error when animation shorthand has no name and keyframe exists', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation: 1s ease forwards; }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should still error when ignore does not match the unused keyframe name', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
		{ ignore: ['other-animation'] },
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Keyframes "slide-in" was declared but never used in an animation-name or animation (${rule_name})`,
	)
})
