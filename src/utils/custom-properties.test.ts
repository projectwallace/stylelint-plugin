import { test, expect } from 'vitest'
import postcss from 'postcss'
import { collect_declared_properties, collect_var_usages } from './custom-properties.js'

function parse(css: string) {
	return postcss.parse(css)
}

// collect_declared_properties

test('collect_declared_properties: finds a custom property declaration', () => {
	const root = parse('a { --color: red; }')
	const result = collect_declared_properties(root)
	expect(result.has('--color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_declared_properties: finds an @property at-rule', () => {
	const root = parse(`
		@property --my-color {
			syntax: '<color>';
			initial-value: red;
			inherits: false;
		}
	`)
	const result = collect_declared_properties(root)
	expect(result.has('--my-color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_declared_properties: ignores non-custom properties', () => {
	const root = parse('a { color: red; font-size: 12px; }')
	const result = collect_declared_properties(root)
	expect(result.size).toBe(0)
})

test('collect_declared_properties: finds multiple custom properties', () => {
	const root = parse('a { --a: 1; --b: 2; }')
	const result = collect_declared_properties(root)
	expect(result.has('--a')).toBe(true)
	expect(result.has('--b')).toBe(true)
	expect(result.size).toBe(2)
})

// collect_var_usages

test('collect_var_usages: finds a var() usage without fallback', () => {
	const root = parse('a { color: var(--color); }')
	const usages = collect_var_usages(root)
	expect(usages.length).toBe(1)
	expect(usages[0].name).toBe('--color')
	expect(usages[0].has_fallback).toBe(false)
})

test('collect_var_usages: finds a var() usage with a fallback', () => {
	const root = parse('a { color: var(--color, red); }')
	const usages = collect_var_usages(root)
	expect(usages.length).toBe(1)
	expect(usages[0].name).toBe('--color')
	expect(usages[0].has_fallback).toBe(true)
})

test('collect_var_usages: finds a var() usage with a var() fallback', () => {
	const root = parse('a { color: var(--color, var(--other)); }')
	const usages = collect_var_usages(root)
	expect(usages.length).toBe(2)
	const outer = usages.find((u) => u.name === '--color')
	const inner = usages.find((u) => u.name === '--other')
	expect(outer?.has_fallback).toBe(true)
	expect(inner?.has_fallback).toBe(false)
})

test('collect_var_usages: finds a var() usage with an empty fallback', () => {
	const root = parse('a { color: var(--color, ); }')
	const usages = collect_var_usages(root)
	expect(usages.length).toBe(1)
	expect(usages[0].name).toBe('--color')
	expect(usages[0].has_fallback).toBe(true)
})

test('collect_var_usages: returns empty array when no var() is present', () => {
	const root = parse('a { color: red; }')
	const usages = collect_var_usages(root)
	expect(usages.length).toBe(0)
})

test('collect_var_usages: finds multiple var() usages', () => {
	const root = parse('a { color: var(--a); background: var(--b, blue); }')
	const usages = collect_var_usages(root)
	expect(usages.length).toBe(2)
	const a = usages.find((u) => u.name === '--a')
	const b = usages.find((u) => u.name === '--b')
	expect(a?.has_fallback).toBe(false)
	expect(b?.has_fallback).toBe(true)
})
