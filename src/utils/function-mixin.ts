import type { AtRule, Container, Declaration, Root } from 'postcss'
import type { Parameter, CSSNode } from '@projectwallace/css-parser'
import {
	is_function,
	is_identifier,
	is_operator,
	is_parameter,
} from '@projectwallace/css-parser/node-types'
import { walk, walk_values } from '@projectwallace/css-parser/walker'
import { is_custom, str_equals } from '@projectwallace/css-parser/string-utils'
import { parse_prelude_of, parse_value_of } from './parse.js'

export type DefinitionKind = 'function' | 'mixin'

export interface Definition {
	kind: DefinitionKind
	node: AtRule
	/** The name as written, e.g. `--foo` or `foo` when invalid */
	name: string
	params: Parameter[]
}

/** The leading name of at-rule params when the parser left the prelude unstructured (invalid names). */
function raw_name(at_rule: AtRule): string {
	const params = at_rule.params.trim()
	let end = 0
	while (
		end < params.length &&
		params[end] !== '(' &&
		params[end] !== ' ' &&
		params[end] !== '\n'
	) {
		end++
	}
	return params.slice(0, end)
}

/** The name and parameters of an `@function` or `@mixin` at-rule. */
export function get_definition(at_rule: AtRule): Definition | undefined {
	const kind = str_equals('function', at_rule.name)
		? 'function'
		: str_equals('mixin', at_rule.name)
			? 'mixin'
			: undefined
	if (!kind) {
		return
	}
	const prelude = parse_prelude_of(at_rule)
	const first = prelude?.first_child
	if (!first || !(is_identifier(first) || is_function(first))) {
		const name = raw_name(at_rule)
		return name ? { kind, node: at_rule, name, params: [] } : undefined
	}
	const name = first.text
	const params: Parameter[] = []
	prelude.for_each((child) => {
		if (is_parameter(child)) {
			params.push(child)
		}
	})
	return { kind, node: at_rule, name: is_function(first) ? first.name : name, params }
}

/** All `@function` and/or `@mixin` definitions of a root, in source order. */
export function get_definitions(root: Root, kind?: DefinitionKind): Definition[] {
	const definitions: Definition[] = []
	root.walkAtRules(/^(function|mixin)$/i, (at_rule) => {
		const definition = get_definition(at_rule)
		if (definition && (!kind || definition.kind === kind)) {
			definitions.push(definition)
		}
	})
	return definitions
}

export interface Apply {
	node: AtRule
	/** The mixin name, e.g. `--foo` */
	name: string
	/** Number of arguments; commas inside nested functions are not counted */
	argument_count: number
}

/** The mixin name and argument count of an `@apply` at-rule. */
export function get_apply(at_rule: AtRule): Apply | undefined {
	if (!str_equals('apply', at_rule.name)) {
		return
	}
	const first = parse_prelude_of(at_rule)?.first_child
	if (!first || !(is_identifier(first) || is_function(first))) {
		const name = raw_name(at_rule)
		return name ? { node: at_rule, name, argument_count: 0 } : undefined
	}
	if (is_identifier(first)) {
		return { node: at_rule, name: first.text, argument_count: 0 }
	}
	if (is_function(first)) {
		let commas = 0
		first.for_each((child) => {
			if (is_operator(child) && child.text === ',') {
				commas++
			}
		})
		return {
			node: at_rule,
			name: first.name,
			argument_count: first.child_count === 0 ? 0 : commas + 1,
		}
	}
}

/** Calls `callback` for every `--name()` custom function call in a declaration value. */
export function walk_function_calls(
	declaration: Declaration,
	callback: (name: string, node: CSSNode) => void,
): void {
	walk_values(parse_value_of(declaration), (node) => {
		if (is_function(node) && is_custom(node.name)) {
			callback(node.name, node)
		}
	})
}

/** Names referenced through `var()` in the declarations and `@apply` arguments below `container`. */
export function collect_var_names(container: Container): Set<string> {
	const names = new Set<string>()
	const add = (node: CSSNode) => {
		if (is_function(node) && str_equals('var', node.name)) {
			const first = node.first_child
			if (first && is_identifier(first)) {
				names.add(first.text)
			}
		}
	}
	container.walkDecls((declaration) => {
		walk_values(parse_value_of(declaration), add)
	})
	container.walkAtRules(/^apply$/i, (at_rule) => {
		const prelude = parse_prelude_of(at_rule)
		if (prelude) {
			walk(prelude, add)
		}
	})
	return names
}
