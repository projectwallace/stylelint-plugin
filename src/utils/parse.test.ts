import postcss from 'postcss'
import { test, expect } from 'vitest'
import { parse_value_of, parse_prelude_of } from './parse.js'

function first_declaration(css: string) {
	let found: postcss.Declaration | undefined
	postcss.parse(css).walkDecls((declaration) => {
		found ??= declaration
	})
	return found!
}

test('parse_value_of does not keep the trailing space postcss leaves in some values', () => {
	const declaration = first_declaration('a { background: red\\9 }')
	expect(declaration.value).toBe('red\\9 ')
	expect(parse_value_of(declaration).text).toBe('red\\9')
})

test('parse_value_of parses once per declaration', () => {
	const declaration = first_declaration('a { color: red; }')
	expect(parse_value_of(declaration)).toBe(parse_value_of(declaration))
})

test('parse_prelude_of has offsets relative to the start of the at-rule', () => {
	const at_rule = postcss.parse('@media   (min-width: 1px) {}').first as postcss.AtRule
	const prelude = parse_prelude_of(at_rule)
	expect(prelude?.start).toBe('@media   '.length)
	expect(parse_prelude_of(postcss.parse('@media {}').first as postcss.AtRule)).toBeUndefined()
})
