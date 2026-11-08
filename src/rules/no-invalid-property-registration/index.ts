import stylelint from 'stylelint'
import type { Root, AtRule, Declaration } from 'postcss'
import {
	parse_value,
	walk_values,
	is_dimension,
	is_function,
	is_identifier,
	is_number,
	is_string,
	str_equals,
	str_index_of,
	is_custom,
	type CSSNode,
} from '@projectwallace/css-parser'
import { unquote } from '../../utils/unquote.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-invalid-property-registration'

const messages = utils.ruleMessages(rule_name, {
	invalid_name: (name: string) => `Expected @property name "${name}" to start with "--"`,
	missing_descriptor: (name: string, descriptor: string) =>
		`Expected @property "${name}" to define the "${descriptor}" descriptor`,
	missing_initial_value: (name: string, syntax: string) =>
		`Expected @property "${name}" to have an "initial-value" descriptor because its syntax is ${syntax}`,
	invalid_syntax: (name: string, syntax: string) =>
		`Expected "syntax" of @property "${name}" to be a quoted string but found [${syntax}]`,
	invalid_inherits: (name: string, value: string) =>
		`Expected "inherits" of @property "${name}" to be "true" or "false" but found [${value}]`,
	dependent_initial_value: (name: string, value: string) =>
		`Expected "initial-value" of @property "${name}" to be computationally independent but found [${value}]`,
	mismatched_initial_value: (name: string, value: string, syntax: string) =>
		`Expected "initial-value" [${value}] of @property "${name}" to match syntax ${syntax}`,
})

const LENGTH_UNITS = new Set([
	'px',
	'em',
	'rem',
	'ex',
	'rex',
	'cap',
	'rcap',
	'ch',
	'rch',
	'ic',
	'ric',
	'lh',
	'rlh',
	'vw',
	'vh',
	'vmin',
	'vmax',
	'vi',
	'vb',
	'svw',
	'svh',
	'svi',
	'svb',
	'lvw',
	'lvh',
	'lvi',
	'lvb',
	'dvw',
	'dvh',
	'dvi',
	'dvb',
	'cm',
	'mm',
	'q',
	'in',
	'pt',
	'pc',
	'cqw',
	'cqh',
	'cqi',
	'cqb',
	'cqmin',
	'cqmax',
])
const ANGLE_UNITS = new Set(['deg', 'grad', 'rad', 'turn'])
const TIME_UNITS = new Set(['s', 'ms'])
const RESOLUTION_UNITS = new Set(['dpi', 'dpcm', 'dppx', 'x'])

function is_dimension_of(node: CSSNode, units: Set<string>): boolean {
	return is_dimension(node) && units.has(node.unit.toLowerCase())
}

function is_zero(node: CSSNode): boolean {
	return is_number(node) && node.value === 0
}

function is_percentage(node: CSSNode): boolean {
	return is_dimension(node) && node.unit === '%'
}

function is_length(node: CSSNode): boolean {
	return is_dimension_of(node, LENGTH_UNITS) || is_zero(node)
}

type Matcher = (node: CSSNode) => boolean

const MATCHERS: Record<string, Matcher> = {
	'<number>': (node) => is_number(node),
	// An <integer> has no decimal point or exponent
	'<integer>': (node) =>
		is_number(node) &&
		Number.isInteger(node.value) &&
		str_index_of('.', node.text) === -1 &&
		str_index_of('e', node.text) === -1,
	'<percentage>': is_percentage,
	'<length>': is_length,
	'<length-percentage>': (node) => is_length(node) || is_percentage(node),
	'<angle>': (node) => is_dimension_of(node, ANGLE_UNITS) || is_zero(node),
	'<time>': (node) => is_dimension_of(node, TIME_UNITS),
	'<resolution>': (node) => is_dimension_of(node, RESOLUTION_UNITS),
	'<flex>': (node) => is_dimension_of(node, new Set(['fr'])),
	// A color is never a bare number, dimension or percentage
	'<color>': (node) => !(is_number(node) || is_dimension(node)),
}

function uses_var(value: CSSNode): boolean {
	let found = false
	walk_values(value, (node) => {
		if (is_function(node) && str_equals('var', node.name)) {
			found = true
		}
	})
	return found
}

function get_descriptor(at_rule: AtRule, name: string): Declaration | undefined {
	let found: Declaration | undefined
	at_rule.each((child) => {
		if (child.type === 'decl' && child.prop.toLowerCase() === name) {
			found = child
		}
	})
	return found
}

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkAtRules(/^property$/i, (at_rule) => {
			const name = at_rule.params.trim()
			if (!name) {
				return
			}

			function report(message: string, node: AtRule | Declaration = at_rule) {
				utils.report({ result, ruleName: rule_name, message, node })
			}

			if (!is_custom(name)) {
				report(messages.invalid_name(name))
			}

			const syntax_decl = get_descriptor(at_rule, 'syntax')
			const inherits_decl = get_descriptor(at_rule, 'inherits')
			const initial_decl = get_descriptor(at_rule, 'initial-value')

			if (!syntax_decl) {
				report(messages.missing_descriptor(name, 'syntax'))
			}
			if (!inherits_decl) {
				report(messages.missing_descriptor(name, 'inherits'))
			}

			if (inherits_decl) {
				const value = inherits_decl.value.trim()
				const [node, ...rest] = parse_value(value).children
				const valid =
					node &&
					rest.length === 0 &&
					is_identifier(node) &&
					(str_equals('true', node.name) || str_equals('false', node.name))
				if (!valid) {
					report(messages.invalid_inherits(name, value), inherits_decl)
				}
			}

			let syntax: string | undefined
			if (syntax_decl) {
				const value = syntax_decl.value.trim()
				const [node, ...rest] = parse_value(value).children
				if (node && rest.length === 0 && is_string(node)) {
					syntax = unquote(node.text).trim()
				} else {
					report(messages.invalid_syntax(name, value), syntax_decl)
				}
			}

			// Without a (valid) syntax we can't say anything about the initial value
			if (syntax === undefined) {
				return
			}

			if (!initial_decl) {
				if (syntax !== '*') {
					report(messages.missing_initial_value(name, `"${syntax}"`))
				}
				return
			}

			const initial_value = initial_decl.value.trim()
			const parsed_initial_value = parse_value(initial_value)
			const initial_nodes = [...parsed_initial_value.children]
			if (uses_var(parsed_initial_value)) {
				report(messages.dependent_initial_value(name, initial_value), initial_decl)
				return
			}

			// Only validate single, non-composite, non-function values against a single data type
			const matcher = MATCHERS[syntax.toLowerCase()]
			if (!matcher || initial_nodes.some((node) => is_function(node))) {
				return
			}
			if (initial_nodes.length !== 1 || !matcher(initial_nodes[0])) {
				report(messages.mismatched_initial_value(name, initial_value, `"${syntax}"`), initial_decl)
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
