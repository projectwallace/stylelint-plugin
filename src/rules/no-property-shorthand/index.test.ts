import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-property-shorthand'

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

	expect(text).toBe(`Shorthand property "background" is not allowed (${rule_name})`)
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

	expect(text).toBe(`Shorthand property "border" is not allowed (${rule_name})`)
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
	expect(warnings[0].text).toBe(`Shorthand property "font" is not allowed (${rule_name})`)
})
