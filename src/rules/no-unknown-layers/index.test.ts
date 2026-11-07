import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'
import { supportsReferenceFiles, createFixtures } from '../test-utils.js'

const write_fixture = createFixtures('no-unknown-layers-test-')

const rule_name = 'projectwallace/no-unknown-layers'

async function lint(code: string, primaryOption: unknown, secondaryOptions?: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]:
				secondaryOptions === undefined ? primaryOption : [primaryOption, secondaryOptions],
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

test('should not error when there is no @layer', async () => {
	const { warnings, errored } = await lint('a { color: red; }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there is no order statement', async () => {
	const { warnings, errored } = await lint(
		`@layer base { a { color: red; } } @layer components { b { color: red; } }`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when every block layer was declared', async () => {
	const { warnings, errored } = await lint(
		`
		@layer reset, base, components;
		@layer base { a { color: red; } }
		@layer components { b { color: red; } }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the statement comes after the block', async () => {
	const { warnings, errored } = await lint(
		`
		@layer base { a { color: red; } }
		@layer base, components;
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for anonymous layers', async () => {
	const { warnings, errored } = await lint(
		`
		@layer base;
		@layer { a { color: red; } }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for a dotted layer whose full path was declared', async () => {
	const { warnings, errored } = await lint(
		`
		@layer framework.base, framework.theme;
		@layer framework.base { a { color: red; } }
		@layer framework { b { color: red; } }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for a nested layer when the nested scope has no order statement', async () => {
	const { warnings, errored } = await lint(
		`
		@layer base, components;
		@layer components { @layer buttons { a { color: red; } } }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a layer was declared by @import', async () => {
	const { warnings, errored } = await lint(
		`
		@import url(vendor.css) layer(vendor);
		@layer base;
		@layer vendor { a { color: red; } }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the unknown layer is ignored', async () => {
	const { warnings, errored } = await lint(
		`
		@layer base;
		@layer utilities { a { color: red; } }
	`,
		true,
		{ ignore: ['utilities'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when a block layer was not declared', async () => {
	const { warnings, errored } = await lint(
		`
		@layer reset, base;
		@layer components { a { color: red; } }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(`Unexpected unknown layer "components" (${rule_name})`)
	expect(warnings[0].line).toBe(3)
})

test('should error once per unknown block', async () => {
	const { warnings } = await lint(
		`
		@layer base;
		@layer a { x { color: red; } }
		@layer b { y { color: red; } }
		@layer base { z { color: red; } }
	`,
		true,
	)
	expect(warnings).toHaveLength(2)
})

test('should error when a nested layer was not declared in an ordered nested scope', async () => {
	const { warnings } = await lint(
		`
		@layer components {
			@layer buttons, cards;
			@layer tabs { a { color: red; } }
		}
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('"components.tabs"')
})

test('should error when only a parent of a dotted layer was declared', async () => {
	const { warnings } = await lint(
		`
		@layer framework;
		@layer framework.base { a { color: red; } }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('"framework.base"')
})

// ---------------------------------------------------------------------------
// Reference files
// ---------------------------------------------------------------------------

test.runIf(supportsReferenceFiles)(
	'should not error when the layer is declared in a reference file',
	async () => {
		const reference = write_fixture('order.css', '@layer reset, base, components;')
		const {
			results: [{ warnings }],
		} = await stylelint.lint({
			code: '@layer components { a { color: red; } }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [reference],
			},
		})
		expect(warnings).toStrictEqual([])
	},
)

test.runIf(supportsReferenceFiles)(
	'should error when the layer is missing from the order in a reference file',
	async () => {
		const reference = write_fixture('order.css', '@layer reset, base;')
		const {
			results: [{ warnings }],
		} = await stylelint.lint({
			code: '@layer components { a { color: red; } }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [reference],
			},
		})
		expect(warnings).toHaveLength(1)
	},
)
