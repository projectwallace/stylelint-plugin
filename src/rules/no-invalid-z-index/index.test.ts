import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-invalid-z-index'

const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

test('should not error for valid positive z-index', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: 1; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for zero z-index', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: 0; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for valid negative z-index', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: -1; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for maximum valid z-index (2147483647)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: 2147483647; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for minimum valid z-index (-2147483648)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: -2147483648; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for z-index: auto', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: auto; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for z-index with var() and no fallback', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: var(--my-z); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for var() with valid fallback', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: var(--my-z, 100); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error for z-index exceeding int32 max (2147483648)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: 2147483648; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('2147483648')
	expect(warnings[0].text).toContain(rule_name)
})

test('should error for z-index below int32 min (-2147483649)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: -2147483649; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('-2147483649')
	expect(warnings[0].text).toContain(rule_name)
})

test('should error for non-integer z-index (float)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: 1.5; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('1.5')
	expect(warnings[0].text).toContain(rule_name)
})

test('should error for var() with invalid fallback value', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: var(--my-z, 2147483648); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('2147483648')
	expect(warnings[0].text).toContain(rule_name)
})

test('should error for var() with non-integer fallback value', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: var(--my-z, 1.5); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain('1.5')
	expect(warnings[0].text).toContain(rule_name)
})

test('should not error when rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { z-index: 9999999999; }',
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

test('should not error for properties other than z-index', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { opacity: 9999999999; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should report the correct line number', async () => {
	const {
		results: [{ warnings }],
	} = await stylelint.lint({
		code: `a {
  color: red;
  z-index: 9999999999;
}`,
		config,
	})

	expect(warnings[0].line).toBe(3)
})
