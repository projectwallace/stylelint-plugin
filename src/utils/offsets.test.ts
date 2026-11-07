import { describe, test, expect } from 'vitest'
import postcss from 'postcss'
import type { AtRule, Declaration } from 'postcss'
import { get_value_offset, get_params_offset } from './offsets.js'

function first_decl(css: string): Declaration {
	let found!: Declaration
	postcss.parse(css).walkDecls((d) => {
		found ??= d
	})
	return found
}

function first_atrule(css: string): AtRule {
	let found!: AtRule
	postcss.parse(css).walkAtRules((a) => {
		found ??= a
	})
	return found
}

describe('get_value_offset', () => {
	test('default separator', () => {
		expect(get_value_offset(first_decl('a { color: red }'))).toBe('color: '.length)
	})
	test('no whitespace around colon', () => {
		expect(get_value_offset(first_decl('a { color:red }'))).toBe('color:'.length)
	})
	test('extra whitespace around colon', () => {
		expect(get_value_offset(first_decl('a { color  :   red }'))).toBe('color  :   '.length)
	})
	test('falls back to ": " when raws.between is missing', () => {
		const decl = first_decl('a { color: red }')
		delete decl.raws.between
		expect(get_value_offset(decl)).toBe('color: '.length)
	})
})

describe('get_params_offset', () => {
	test('default separator', () => {
		expect(get_params_offset(first_atrule('@media (min-width: 1px) {}'))).toBe('@media '.length)
	})
	test('extra whitespace after name', () => {
		expect(get_params_offset(first_atrule('@keyframes   foo {}'))).toBe('@keyframes   '.length)
	})
	test('no whitespace after name', () => {
		expect(get_params_offset(first_atrule('@media(min-width: 1px) {}'))).toBe('@media'.length)
	})
	test('falls back to a single space when raws.afterName is missing', () => {
		const at_rule = first_atrule('@property --a {}')
		delete at_rule.raws.afterName
		expect(get_params_offset(at_rule)).toBe('@property '.length)
	})
})
