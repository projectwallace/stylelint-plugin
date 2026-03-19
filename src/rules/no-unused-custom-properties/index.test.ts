import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'project-wallace/no-unused-custom-properties'

test('should not error on a single used custom property', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a {
				--used: 1;
				color: var(--used);
			}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on when a custom property is used in a fallback var()', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a {
				--used-in-fallback: 1;
				color: var(--not-defined, var(--used-in-fallback));
			}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error on a single unused custom property', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { --unused: 1 }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings

	expect(text).toBe(`"--unused" was declared but never used in a var() (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(5)
})

test('should not error on when an unused custom property is allowed in options.ignoreProperties (string)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignoreProperties: ['--ignored'],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --ignored: 1 }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on when an unused custom property is allowed in options.ignoreProperties (RegExp)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignoreProperties: [/regex/],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --regexp-ingored: 1 }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a custom property declared via @property is used in a var()', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@property --my-color {
				syntax: '<color>';
				initial-value: red;
				inherits: false;
			}
			a { color: var(--my-color); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a custom property declared via @property is never used', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@property --unused-color {
				syntax: '<color>';
				initial-value: red;
				inherits: false;
			}`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--unused-color" was declared but never used in a var() (${rule_name})`,
	)
})

test('ignores options when options.ignoreProperties types are incorrect', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignoreProperties: [false],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --unused: 1 }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings

	expect(text).toBe(`"--unused" was declared but never used in a var() (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(5)
})
