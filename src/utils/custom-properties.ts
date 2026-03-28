import type { Root, Declaration, AtRule } from 'postcss'
import { FUNCTION, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse_value } from '@projectwallace/css-parser/parse-value'

export function collect_declared_properties(root: Root): Map<string, Declaration | AtRule> {
	const properties = new Map<string, Declaration | AtRule>()

	root.walkAtRules('property', function (atRule) {
		const property_name = atRule.params.trim()
		if (property_name.startsWith('--')) {
			properties.set(property_name, atRule)
		}
	})

	root.walkDecls(function (declaration) {
		if (declaration.prop.startsWith('--')) {
			properties.set(declaration.prop, declaration)
		}
	})

	return properties
}

export interface VarUsage {
	name: string
	has_fallback: boolean
	node: Declaration
}

export function collect_var_usages(root: Root): VarUsage[] {
	const usages: VarUsage[] = []

	root.walkDecls(function (declaration) {
		const parsed = parse_value(declaration.value)

		walk(parsed, (node) => {
			if (node.type !== FUNCTION || node.name !== 'var') return

			const first = node.first_child
			if (first === null || first.type !== IDENTIFIER || !first.text.startsWith('--')) return

			usages.push({
				name: first.text,
				has_fallback: first.next_sibling !== null,
				node: declaration,
			})
		})
	})

	return usages
}
