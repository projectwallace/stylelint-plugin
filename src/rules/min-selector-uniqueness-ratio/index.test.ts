import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/min-selector-uniqueness-ratio'

test('should not run when config is set to a negative value', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } a { color: blue; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when config is set to a value greater than 1', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1.5,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } a { color: blue; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are no rules', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.66,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ``,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when all selectors are unique', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.66,
		},
	}

	// 3 unique selectors out of 3 total = 1.0
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } b { color: blue; } c { color: green; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when uniqueness ratio is exactly at the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.5,
		},
	}

	// 2 unique selectors out of 4 total = 0.5
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } a { color: blue; } b { color: green; } b { color: pink; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when uniqueness ratio is below the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0.66,
		},
	}

	// 1 unique selector out of 3 total = 0.33
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } a { color: blue; } a { color: green; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
	})
	expect(warnings[0].text).toContain('less than the required 0.66')
})

test('should count individual selectors in selector lists', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	// "a, b" counts as 2 selectors; "a" duplicates one → 2 unique out of 3 total ≈ 0.67
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, b { color: red; } a { color: blue; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should not error when config is 0', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 0,
		},
	}

	// Even with all duplicates, ratio is 0.33 which is >= 0
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } a { color: blue; } a { color: green; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should count selectors inside nested atrules', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	// `a` appears outside and inside @media → 1 unique out of 2 total = 0.5 < 1
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } @media (min-width: 600px) { a { color: blue; } }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should count selectors from nested rules', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	// outer `a`, `b` each have nested `& .foo` → `& .foo` duplicated: 3 unique out of 4 total = 0.75 < 1
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { & .foo { color: red; } } b { & .foo { color: blue; } }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should not error when selectors inside nested atrules are all unique', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	// `a` outside, `b` inside @media → 2 unique out of 2 total = 1.0
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } @media (min-width: 600px) { b { color: blue; } }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
