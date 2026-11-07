import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'
import { supportsReferenceFiles, createFixtures } from '../test-utils.js'

const write_fixture = createFixtures('no-unused-font-faces-test-')

const rule_name = 'projectwallace/no-unused-font-faces'

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

test('should not error when there are no @font-face rules', async () => {
	const { warnings, errored } = await lint('a { font-family: Inter; }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when family is used in font-family', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(inter.woff2); }
		body { font-family: Inter, sans-serif; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when quoting differs between definition and usage', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: "Open Sans"; src: url(a.woff2); }
		body { font-family: 'Open Sans', sans-serif; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when casing differs', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: inter; src: url(a.woff2); }
		body { font-family: INTER; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when family is used in the font shorthand', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(inter.woff2); }
		body { font: 16px/1.5 Inter, sans-serif; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when family is used in a custom property', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(inter.woff2); }
		:root { --font-body: Inter, sans-serif; }
		body { font-family: var(--font-body); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when family is used in a var() fallback', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(inter.woff2); }
		body { font-family: var(--font, Inter); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when family is used in @font-feature-values', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(inter.woff2); }
		@font-feature-values Inter { @styleset { nice: 1; } }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple @font-face rules share a used family', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; font-weight: 400; src: url(a.woff2); }
		@font-face { font-family: Inter; font-weight: 700; src: url(b.woff2); }
		body { font-family: Inter; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unused family is ignored by string', async () => {
	const { warnings, errored } = await lint(
		`@font-face { font-family: Icons; src: url(a.woff2); }`,
		true,
		{ ignore: ['Icons'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unused family is ignored by regex', async () => {
	const { warnings, errored } = await lint(
		`@font-face { font-family: Icons-Regular; src: url(a.woff2); }`,
		true,
		{ ignore: [/^Icons/] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when family is never used', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(inter.woff2); }
		body { font-family: Arial, sans-serif; }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		'Unexpected unused @font-face "Inter" (projectwallace/no-unused-font-faces)',
	)
	expect(warnings[0].line).toBe(2)
})

test('should error when the only usage is inside another @font-face', async () => {
	const { warnings } = await lint(
		`@font-face { font-family: Inter; src: local(Inter), url(inter.woff2); }`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

test('should error on every @font-face of an unused family', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; font-weight: 400; src: url(a.woff2); }
		@font-face { font-family: Inter; font-weight: 700; src: url(b.woff2); }
	`,
		true,
	)
	expect(warnings).toHaveLength(2)
})

test('should only error on the unused family', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		@font-face { font-family: Lora; src: url(b.woff2); }
		body { font-family: Inter; }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('"Lora"')
})

test('should error when only a similarly named family is used', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		body { font-family: "Inter Tight"; }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

// ---------------------------------------------------------------------------
// Reference files
// ---------------------------------------------------------------------------

test.runIf(supportsReferenceFiles)(
	'should not error when family is used in a reference file',
	async () => {
		const reference = write_fixture('reference.css', 'body { font-family: Inter; }')
		const {
			results: [{ warnings }],
		} = await stylelint.lint({
			code: '@font-face { font-family: Inter; src: url(a.woff2); }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [reference],
			},
		})
		expect(warnings).toStrictEqual([])
	},
)
