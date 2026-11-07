import { test, expect } from 'vitest'
import { split_font_families } from './font-families.js'

test('splits on commas', () => {
	expect(split_font_families('Inter, Arial, sans-serif')).toStrictEqual([
		'Inter',
		'Arial',
		'sans-serif',
	])
})

test('removes quotes and keeps commas inside quotes', () => {
	expect(split_font_families(`"Open Sans", 'Foo, Bar'`)).toStrictEqual(['Open Sans', 'Foo, Bar'])
})

test('collapses whitespace in unquoted names', () => {
	expect(split_font_families('Open   Sans')).toStrictEqual(['Open Sans'])
})

test('does not split on commas inside functions', () => {
	expect(split_font_families('var(--a, Inter), serif')).toStrictEqual(['var(--a, Inter)', 'serif'])
})

test('returns an empty array for an empty value', () => {
	expect(split_font_families('')).toStrictEqual([])
})
