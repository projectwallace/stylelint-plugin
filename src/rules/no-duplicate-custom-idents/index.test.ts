import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-custom-idents'

async function lint(code: string) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}

// ---------------------------------------------------------------------------
// No violation — @keyframes
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

test.each(['none', 'initial', 'inherit', 'unset', 'revert', 'revert-layer'])(
	'should not error when keyframe name is CSS-wide keyword: %s',
	async (keyword) => {
		const { warnings, errored } = await lint(
			`@keyframes ${keyword} {} @keyframes ${keyword} {}`,
		)
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

// ---------------------------------------------------------------------------
// Violations — @keyframes
// ---------------------------------------------------------------------------

test('should error when the same keyframe name is defined twice', async () => {
	const { warnings, errored } = await lint('@keyframes test {} @keyframes test {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate custom identifier "test" (${rule_name})`,
	})
})

test('should error when the same keyframe name is defined three times', async () => {
	const { warnings, errored } = await lint(
		'@keyframes test {} @keyframes test {} @keyframes test {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should report on the correct line for a duplicate keyframe', async () => {
	const { warnings } = await lint(`@keyframes foo {}
@keyframes foo {}`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 12,
		endColumn: 15,
	})
})

// ---------------------------------------------------------------------------
// No violation — @property
// ---------------------------------------------------------------------------

test('should not error when an @property name is used only once', async () => {
	const { warnings, errored } = await lint(
		'@property --color { syntax: "<color>"; inherits: false; initial-value: red; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct @property names are used', async () => {
	const { warnings, errored } = await lint(
		'@property --foo { syntax: "*"; inherits: false; } @property --bar { syntax: "*"; inherits: false; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations — @property
// ---------------------------------------------------------------------------

test('should error when the same @property name is defined twice', async () => {
	const { warnings, errored } = await lint(
		'@property --color { syntax: "*"; inherits: false; } @property --color { syntax: "*"; inherits: false; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate custom identifier "--color" (${rule_name})`,
	})
})

test('should report on the correct line for a duplicate @property', async () => {
	const { warnings } = await lint(`@property --foo { syntax: "*"; inherits: false; }
@property --foo { syntax: "*"; inherits: false; }`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 11,
		endColumn: 16,
	})
})

// ---------------------------------------------------------------------------
// No violation — container-name / container
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
	// `inline-size` after `/` is the container type, not a container name
	const { warnings, errored } = await lint(
		'.a { container: sidebar / inline-size; } .b { container: header / inline-size; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations — container-name / container
// ---------------------------------------------------------------------------

test('should error when the same container-name is defined twice', async () => {
	const { warnings, errored } = await lint(
		'.a { container-name: sidebar; } .b { container-name: sidebar; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate custom identifier "sidebar" (${rule_name})`,
	})
})

test('should error when the same container name is set via the container shorthand twice', async () => {
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

test('should report on the correct column for a duplicate container-name', async () => {
	const { warnings } = await lint(`.a { container-name: sidebar; }
.b { container-name: sidebar; }`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 22,
		endColumn: 29,
	})
})

// ---------------------------------------------------------------------------
// No violation — anchor-name
// ---------------------------------------------------------------------------

test('should not error when an anchor name is used only once', async () => {
	const { warnings, errored } = await lint('.a { anchor-name: --my-anchor; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple distinct anchor names are used', async () => {
	const { warnings, errored } = await lint(
		'.a { anchor-name: --foo; } .b { anchor-name: --bar; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when anchor-name is none', async () => {
	const { warnings, errored } = await lint(
		'.a { anchor-name: none; } .b { anchor-name: none; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple anchor names on one element are all distinct', async () => {
	const { warnings, errored } = await lint('.a { anchor-name: --foo, --bar; }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations — anchor-name
// ---------------------------------------------------------------------------

test('should error when the same anchor name is defined twice', async () => {
	const { warnings, errored } = await lint(
		'.a { anchor-name: --foo; } .b { anchor-name: --foo; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate custom identifier "--foo" (${rule_name})`,
	})
})

test('should error when a comma-separated anchor name list contains a duplicate', async () => {
	const { warnings, errored } = await lint(
		'.a { anchor-name: --foo; } .b { anchor-name: --bar, --foo; }',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		text: `Unexpected duplicate custom identifier "--foo" (${rule_name})`,
	})
})

test('should report on the correct column for a duplicate anchor-name', async () => {
	const { warnings } = await lint(`.a { anchor-name: --foo; }
.b { anchor-name: --foo; }`)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 19,
		endColumn: 24,
	})
})

// ---------------------------------------------------------------------------
// Namespaces are independent
// ---------------------------------------------------------------------------

test('should not error when the same name is used as both a keyframe and a container name', async () => {
	// `main` as keyframe name and `main` as container name are different namespaces
	const { warnings, errored } = await lint(
		'@keyframes main {} .a { container-name: main; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same ident is used as both a keyframe and an anchor name', async () => {
	const { warnings, errored } = await lint(
		'@keyframes --foo {} .a { anchor-name: --foo; }',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Option validation
// ---------------------------------------------------------------------------

test('should not run when the option is invalid', async () => {
	const {
		results: [{ errored }],
	} = await stylelint.lint({
		code: '@keyframes foo {} @keyframes foo {}',
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: 'invalid',
			},
		},
	})
	expect(errored).toBe(true)
})

test('should not run when the rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@keyframes foo {} @keyframes foo {}',
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: null,
			},
		},
	})
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
