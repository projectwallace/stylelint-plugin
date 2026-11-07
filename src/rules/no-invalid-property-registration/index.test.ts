import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-invalid-property-registration'

async function lint(code: string, primaryOption: unknown) {
	const config = {
		plugins: [plugin],
		rules: { [rule_name]: primaryOption },
	}
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}

async function texts(code: string) {
	const { warnings } = await lint(code, true)
	return warnings.map((w) => w.text.replace(` (${rule_name})`, ''))
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

test('should not error when there is no @property', async () => {
	expect(await texts('a { color: red; }')).toStrictEqual([])
})

test('should not error for a complete registration', async () => {
	expect(
		await texts(`@property --size { syntax: "<length>"; inherits: false; initial-value: 0px; }`),
	).toStrictEqual([])
})

test('should not require initial-value for the universal syntax', async () => {
	expect(await texts(`@property --anything { syntax: "*"; inherits: true; }`)).toStrictEqual([])
})

test.each([
	['<number>', '1.5'],
	['<number>', '-.5'],
	['<integer>', '3'],
	['<percentage>', '50%'],
	['<length>', '0'],
	['<length>', '10px'],
	['<length>', '10PX'],
	['<length>', '2.5rem'],
	['<length-percentage>', '10%'],
	['<length-percentage>', '4px'],
	['<angle>', '45deg'],
	['<angle>', '0'],
	['<time>', '200ms'],
	['<color>', 'red'],
	['<color>', '#fff'],
	['<color>', 'rgb(0 0 0)'],
	['<resolution>', '2dppx'],
	['<flex>', '1fr'],
])('should not error when %s matches initial-value %s', async (syntax, value) => {
	expect(
		await texts(`@property --x { syntax: "${syntax}"; inherits: false; initial-value: ${value}; }`),
	).toStrictEqual([])
})

test('should not validate initial-value for unions or multipliers', async () => {
	expect(
		await texts(
			`@property --x { syntax: "<length> | auto"; inherits: false; initial-value: auto; }`,
		),
	).toStrictEqual([])
	expect(
		await texts(`@property --x { syntax: "<length>+"; inherits: false; initial-value: 1px 2px; }`),
	).toStrictEqual([])
})

test('should not validate initial-value when it is a function', async () => {
	expect(
		await texts(
			`@property --x { syntax: "<length>"; inherits: false; initial-value: calc(1px + 2px); }`,
		),
	).toStrictEqual([])
})

test('should accept single quotes and uppercase descriptors', async () => {
	expect(
		await texts(`@property --x { SYNTAX: '<number>'; INHERITS: FALSE; INITIAL-VALUE: 1; }`),
	).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when name does not start with --', async () => {
	expect(
		await texts(`@property size { syntax: "<length>"; inherits: false; initial-value: 0px; }`),
	).toStrictEqual(['Expected @property name "size" to start with "--"'])
})

test('should error when syntax is missing', async () => {
	expect(await texts(`@property --x { inherits: false; initial-value: 0px; }`)).toStrictEqual([
		'Expected @property "--x" to define the "syntax" descriptor',
	])
})

test('should error when inherits is missing', async () => {
	expect(await texts(`@property --x { syntax: "<length>"; initial-value: 0px; }`)).toStrictEqual([
		'Expected @property "--x" to define the "inherits" descriptor',
	])
})

test('should error when initial-value is missing for a non-universal syntax', async () => {
	expect(await texts(`@property --x { syntax: "<length>"; inherits: false; }`)).toStrictEqual([
		'Expected @property "--x" to have an "initial-value" descriptor because its syntax is "<length>"',
	])
})

test('should error on an empty @property block', async () => {
	expect(await texts(`@property --x {}`)).toStrictEqual([
		'Expected @property "--x" to define the "syntax" descriptor',
		'Expected @property "--x" to define the "inherits" descriptor',
	])
})

test('should error when syntax is not a quoted string', async () => {
	expect(
		await texts(`@property --x { syntax: <length>; inherits: false; initial-value: 0px; }`),
	).toStrictEqual([
		'Expected "syntax" of @property "--x" to be a quoted string but found [<length>]',
	])
})

test('should error when inherits is not a boolean', async () => {
	expect(
		await texts(`@property --x { syntax: "<length>"; inherits: yes; initial-value: 0px; }`),
	).toStrictEqual([
		'Expected "inherits" of @property "--x" to be "true" or "false" but found [yes]',
	])
})

test('should error when initial-value uses var()', async () => {
	expect(
		await texts(`@property --x { syntax: "<length>"; inherits: false; initial-value: var(--y); }`),
	).toStrictEqual([
		'Expected "initial-value" of @property "--x" to be computationally independent but found [var(--y)]',
	])
})

test.each([
	['<length>', '10'],
	['<length>', '10%'],
	['<length>', 'red'],
	['<number>', '10px'],
	['<number>', 'auto'],
	['<integer>', '1.5'],
	['<integer>', '1e2'],
	['<percentage>', '10'],
	['<angle>', '10px'],
	['<time>', '10px'],
	['<color>', '10px'],
	['<color>', '50%'],
	['<color>', '3'],
])('should error when %s does not match initial-value %s', async (syntax, value) => {
	expect(
		await texts(`@property --x { syntax: "${syntax}"; inherits: false; initial-value: ${value}; }`),
	).toStrictEqual([
		`Expected "initial-value" [${value}] of @property "--x" to match syntax "${syntax}"`,
	])
})

test('should report the declaration position', async () => {
	const { warnings } = await lint(
		`@property --x {
	syntax: "<length>";
	inherits: false;
	initial-value: red;
}`,
		true,
	)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].line).toBe(4)
})

test('should report every @property separately', async () => {
	const { warnings } = await lint(
		`
		@property --a { inherits: false; }
		@property --b { syntax: "<number>"; }
	`,
		true,
	)
	expect(warnings).toHaveLength(3)
})
