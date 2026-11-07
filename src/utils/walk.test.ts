import { describe, test, expect } from 'vitest'
import postcss from 'postcss'
import { walk_decls, walk_custom_decls, walk_atrules } from './walk.js'

const css = `
@media (min-width: 1px) { a { Z-Index: 1; color: red } }
@MEDIA print { b { z-index: 2 } }
@keyframes spin { to { transform: none } }
:root { --a: 1; --B: 2; -webkit-foo: 3; font: 12px serif; font-size: 1px }
`

describe('walk_decls', () => {
	test('matches a single property case-insensitively', () => {
		const seen: string[] = []
		walk_decls(postcss.parse(css), ['z-index'], (d) => {
			seen.push(d.value)
		})
		expect(seen).toEqual(['1', '2'])
	})

	test('matches any of multiple properties, exactly', () => {
		const seen: string[] = []
		walk_decls(postcss.parse(css), ['font', 'color'], (d) => {
			seen.push(d.prop)
		})
		expect(seen).toEqual(['color', 'font'])
	})

	test('does not match prefixes or suffixes', () => {
		const seen: string[] = []
		walk_decls(postcss.parse(css), ['font-siz', 'font-size-adjust', 'ont'], (d) => {
			seen.push(d.prop)
		})
		expect(seen).toEqual([])
	})

	test('can be limited to a nested container', () => {
		const root = postcss.parse(css)
		const seen: string[] = []
		root.walkAtRules('keyframes', (at_rule) => {
			walk_decls(at_rule, ['transform'], (d) => {
				seen.push(d.prop)
			})
		})
		expect(seen).toEqual(['transform'])
	})

	test('returning false stops the walk', () => {
		const seen: string[] = []
		walk_decls(postcss.parse(css), ['z-index'], (d) => {
			seen.push(d.value)
			return false
		})
		expect(seen).toEqual(['1'])
	})
})

describe('walk_custom_decls', () => {
	test('matches custom properties only', () => {
		const seen: string[] = []
		walk_custom_decls(postcss.parse(css), (d) => {
			seen.push(d.prop)
		})
		expect(seen).toEqual(['--a', '--B'])
	})

	test('returning false stops the walk', () => {
		const seen: string[] = []
		walk_custom_decls(postcss.parse(css), (d) => {
			seen.push(d.prop)
			return false
		})
		expect(seen).toEqual(['--a'])
	})
})

describe('walk_atrules', () => {
	test('matches case-insensitively', () => {
		const seen: string[] = []
		walk_atrules(postcss.parse(css), ['media'], (a) => {
			seen.push(a.params)
		})
		expect(seen).toEqual(['(min-width: 1px)', 'print'])
	})

	test('matches any of multiple names', () => {
		const seen: string[] = []
		walk_atrules(postcss.parse(css), ['keyframes', 'media'], (a) => {
			seen.push(a.name)
		})
		expect(seen).toEqual(['media', 'MEDIA', 'keyframes'])
	})

	test('returning false stops the walk', () => {
		const seen: string[] = []
		walk_atrules(postcss.parse(css), ['media'], (a) => {
			seen.push(a.params)
			return false
		})
		expect(seen).toEqual(['(min-width: 1px)'])
	})
})
