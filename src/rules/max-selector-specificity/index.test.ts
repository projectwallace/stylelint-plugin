import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/max-selector-specificity'

test('should not run with invalid option (not an array)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 1,
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `#a { color: red; }`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings).toHaveLength(1)
})

test('should not run with invalid option (wrong length)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 1],
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `#a { color: red; }`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings).toHaveLength(1)
})

test('should not run with invalid option (negative number)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, -1, 0],
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `#a { color: red; }`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings).toHaveLength(1)
})

test('should not run with invalid option (float value)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 2.5, 0],
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `#a { color: red; }`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings).toHaveLength(1)
})

test('should not error when specificity equals the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 0, 1],
		},
	}

	// `a` has specificity [0, 0, 1] which equals the limit
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when specificity is below the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 4, 0],
		},
	}

	// `.foo` has specificity [0, 1, 0] which is below [0, 4, 0]
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `.foo { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a selector list where all selectors are within limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 4, 0],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, .foo, .bar { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when specificity exceeds the limit', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 4, 0],
		},
	}

	// `#foo .bar a` has specificity [1, 1, 1] which exceeds [0, 4, 0] (id component)
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `#foo .bar a { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 1,
		rule: rule_name,
		severity: 'error',
		text: 'Specificity of "#foo .bar a" is [1, 1, 1] which is greater than the allowed [0, 4, 0] (projectwallace/max-selector-specificity)',
	})
})

test('should error only on the violating selector in a selector list', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 4, 0],
		},
	}

	// `#foo` has specificity [1, 0, 0], `a` has [0, 0, 1]
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a, #foo { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
		text: 'Specificity of "#foo" is [1, 0, 0] which is greater than the allowed [0, 4, 0] (projectwallace/max-selector-specificity)',
	})
})

test('should error on multiple violating selectors across rules', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 0, 0],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; } .foo { color: blue; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should match issue example: [1, 3, 1] violates [0, 4, 0]', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 4, 0],
		},
	}

	// #foo .a .b .c span has specificity [1, 3, 1]
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `#foo .a .b .c span { color: red; }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		rule: rule_name,
		severity: 'error',
		text: 'Specificity of "#foo .a .b .c span" is [1, 3, 1] which is greater than the allowed [0, 4, 0] (projectwallace/max-selector-specificity)',
	})
})

test('should match issue example: [0, 2, 0] passes [0, 4, 0]', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [0, 4, 0],
		},
	}

	// .a .b has specificity [0, 2, 0]
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `.a .b { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
