import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unknown-custom-property'

test('should not error when a custom property is declared and used', async () => {
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
				--color: red;
				color: var(--color);
			}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a custom property is used but never declared', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings

	expect(text).toBe(`"--undeclared" is used in a var() but was never declared (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(16)
})

test('should not error when a custom property declared via @property is used', async () => {
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

test('should error when var() uses an undeclared property even if @property exists for another', async () => {
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
			@property --declared {
				syntax: '<color>';
				initial-value: red;
				inherits: false;
			}
			a { color: var(--undeclared); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('should error on undeclared var() with fallback when allowFallback is not set', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, red); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('should not error on undeclared var() with fallback when allowFallback is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowFallback: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, red); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared var() with var() fallback when allowFallback is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowFallback: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, var(--also-undeclared)); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--also-undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('should not error on undeclared var() with empty fallback when allowFallback is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowFallback: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, ); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared property matched by allowList string', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['--external-color'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--external-color); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared property matched by allowList RegExp', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: [/^--external-/] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--external-color); background: var(--external-bg); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error on undeclared property not matched by allowList', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['--external-color'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--external-color); background: var(--undeclared); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('ignores allowList when entries have incorrect types', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: [false] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBeGreaterThanOrEqual(1)
})
