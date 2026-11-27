import postcss from 'postcss'
import { test, expect } from 'vitest'
import { get_definitions, get_apply, collect_var_names } from './function-mixin.js'

test('get_definitions reads names and parameters', () => {
	const root = postcss.parse(`
		@function --f(--a <length>: 1px, --b) returns <length> { result: 1px }
		@mixin --m(--x) {}
		@mixin --n {}
	`)
	const definitions = get_definitions(root)
	expect(definitions.map((d) => [d.kind, d.name, d.params.map((p) => p.name)])).toStrictEqual([
		['function', '--f', ['--a', '--b']],
		['mixin', '--m', ['--x']],
		['mixin', '--n', []],
	])
	expect(get_definitions(root, 'mixin')).toHaveLength(2)
})

test('get_apply reads the mixin name and argument count', () => {
	const root = postcss.parse('.a { @apply --a; @apply --b(1px, 2px) { color: red } }')
	const applies: Array<[string, number]> = []
	root.walkAtRules('apply', (at_rule) => {
		const apply = get_apply(at_rule)!
		applies.push([apply.name, apply.argument_count])
	})
	expect(applies).toStrictEqual([
		['--a', 0],
		['--b', 2],
	])
})

test('collect_var_names finds var() in declarations and @apply arguments', () => {
	const root = postcss.parse(
		'@mixin --m(--a, --b) { color: var(--a); @apply --n(var(--b)); width: calc(var(--c, var(--d))) }',
	)
	const at_rule = root.first as postcss.AtRule
	expect([...collect_var_names(at_rule)].sort()).toStrictEqual(['--a', '--b', '--c', '--d'])
})
