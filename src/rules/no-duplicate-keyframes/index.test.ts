import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-keyframes'

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

test('should not error when a keyframe name is used only once', async () => {
	const { warnings, errored } = await lint('@keyframes fade-in {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct keyframe names are used', async () => {
	const { warnings, errored } = await lint('@keyframes foo {} @keyframes bar {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test.each(['none', 'initial', 'inherit', 'unset', 'revert', 'revert-layer', 'auto'])(
	'should not error when keyframe name is CSS-wide keyword: %s',
	async (keyword) => {
		const { warnings, errored } = await lint(`@keyframes ${keyword} {} @keyframes ${keyword} {}`)
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when the same keyframe name is defined twice', async () => {
	const { warnings, errored } = await lint('@keyframes test {} @keyframes test {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate @keyframes name "test" (${rule_name})`,
	})
})

test('should error when the same keyframe name is defined three times', async () => {
	const { warnings, errored } = await lint(
		'@keyframes test {} @keyframes test {} @keyframes test {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should report on the correct line and column for a duplicate', async () => {
	const { warnings } = await lint(`@keyframes foo {}
@keyframes foo {}`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 12,
		endColumn: 15,
	})
})

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when the option is invalid', async () => {
	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: '@keyframes foo {} @keyframes foo {}',
		config: { plugins: [plugin], rules: { [rule_name]: 'invalid' } },
	})
	expect(errored).toBe(true)
})

test('should not run when the rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@keyframes foo {} @keyframes foo {}',
		config: { plugins: [plugin], rules: { [rule_name]: null } },
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
