import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin, { rule_name } from './index.js'

const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

test('should not error on a longhand property', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: green }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a custom property', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --my-background: red }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a custom property whose name matches a shorthand', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --font: bold 16px sans-serif }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error on the "background" shorthand', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: red }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)

	const [{ text }] = warnings

	expect(text).toBe(`Unexpected shorthand property "background" (${rule_name})`)
})

test('should error on the "border" shorthand', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { border: 1px solid red }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)

	const [{ text }] = warnings

	expect(text).toBe(`Unexpected shorthand property "border" (${rule_name})`)
})

test('should error on the "font" shorthand', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font: bold 16px/1.5 sans-serif }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error on multiple shorthand properties', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: red; border: 1px solid blue }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should match shorthand properties case-insensitively', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { BACKGROUND: red }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should not error when a shorthand is in the ignore (string)', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: red }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { ignore: ['background'] }],
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a shorthand matches an ignore RegExp', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { border-radius: 4px }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { ignore: [/^border-/] }],
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error on shorthands not in the ignore', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: red; font: bold 16px sans-serif }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { ignore: ['background'] }],
			},
		},
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(`Unexpected shorthand property "font" (${rule_name})`)
})

test('should not error on a single-value shorthand when "single-value" is ignored', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { margin-inline: var(--my-margin) }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { ignore: ['single-value'] }],
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a keyword-only single-value shorthand when "single-value" is ignored', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font: inherit }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { ignore: ['single-value'] }],
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error on multi-value shorthands when "single-value" is ignored', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font: bold 16px/1.5 sans-serif }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { ignore: ['single-value'] }],
			},
		},
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should only flag properties in the disallow list', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font: bold 16px sans-serif; animation: foo 1s; background: red }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { disallow: ['font', 'animation'] }],
			},
		},
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
	expect(warnings[0].text).toBe(`Unexpected shorthand property "font" (${rule_name})`)
	expect(warnings[1].text).toBe(`Unexpected shorthand property "animation" (${rule_name})`)
})

test('should not flag shorthands not in the disallow list', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: red; border: 1px solid blue }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { disallow: ['font'] }],
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should support RegExp patterns in disallow', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { border: 1px solid red; border-radius: 4px; background: red }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { disallow: [/^border/] }],
			},
		},
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should combine disallow with ignore single-value', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font: inherit; font: bold 16px sans-serif }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { disallow: ['font'], ignore: ['single-value'] }],
			},
		},
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(`Unexpected shorthand property "font" (${rule_name})`)
})

test('should combine "single-value" with property name ignores', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { font: inherit; background: no-repeat center; padding: 10px 20px }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: [true, { ignore: ['single-value', 'background'] }],
			},
		},
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(`Unexpected shorthand property "padding" (${rule_name})`)
})
