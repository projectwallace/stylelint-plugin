import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-important-in-keyframes'

async function lint(code: string) {
	const {
		results: [result],
	} = await stylelint.lint({
		code,
		config: {
			plugins: [plugin],
			rules: { [rule_name]: true },
		},
	})
	return result
}

// ---------------------------------------------------------------------------
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when primary option is invalid', async () => {
	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: `@keyframes fade { from { opacity: 0 !important; } }`,
		config: {
			plugins: [plugin],
			rules: { [rule_name]: [2] },
		},
	})

	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when @keyframes has no !important', async () => {
	const { warnings, errored } = await lint(
		`@keyframes fade { from { opacity: 0; } to { opacity: 1; } }`,
	)

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for declarations with !important outside @keyframes', async () => {
	const { warnings, errored } = await lint(`a { color: red !important; }`)

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for an empty @keyframes block', async () => {
	const { warnings, errored } = await lint(`@keyframes fade {}`)

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when a keyframe step has !important', async () => {
	const { warnings, errored } = await lint(
		`@keyframes fade { from { opacity: 0 !important; } to { opacity: 1; } }`,
	)

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Unexpected !important inside @keyframes (${rule_name})`)
})

test('should error for each declaration with !important', async () => {
	const { warnings, errored } = await lint(
		`@keyframes fade { from { opacity: 0 !important; color: red !important; } }`,
	)

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should error for !important in any keyframe step', async () => {
	const { warnings, errored } = await lint(
		`@keyframes slide { 0% { transform: translateX(0) !important; } 100% { transform: translateX(100px); } }`,
	)

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should error for each @keyframes block with !important independently', async () => {
	const { warnings, errored } = await lint(
		`@keyframes fade { from { opacity: 0 !important; } } @keyframes slide { to { transform: translateX(100px) !important; } }`,
	)

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should error for vendor-prefixed @keyframes with !important', async () => {
	const { warnings, errored } = await lint(
		`@-webkit-keyframes fade { from { opacity: 0 !important; } }`,
	)

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})
