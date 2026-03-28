import type { Root, Declaration, AtRule } from 'postcss'
import { OPERATOR, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { keywords } from '@projectwallace/css-analyzer/values'

export function collect_declared_container_names(root: Root): Map<string, Declaration> {
	const names = new Map<string, Declaration>()

	root.walkDecls(/^container(-name)?$/i, (decl) => {
		let value = decl.value.trim()

		// Skip `none` - not a real container name
		if (keywords.has(value)) return

		// Multiple names can be space-separated

		const ast = parse_value(value)
		for (const node of ast) {
			// Case: `container` shorthand
			if (node.type === OPERATOR) {
				break
			}
			if (node.type === IDENTIFIER) {
				const name = node.text
				if (!names.has(name)) {
					names.set(name, decl)
				}
			}
		}
	})

	return names
}

export interface ContainerUsage {
	name: string
	node: AtRule
}

export function collect_container_name_usages(root: Root): ContainerUsage[] {
	const usages: ContainerUsage[] = []

	root.walkAtRules('container', (atRule) => {
		const params = atRule.params.trim()

		const prelude = parse_atrule_prelude('container', params)
		// => [ContainerQuery]
		const first_child = prelude.at(0)?.first_child
		// => Identifier or Function, usually

		// FUNCTION nodes (e.g. style(), scroll-state()) are never container names
		// 'not', 'and', 'or' are query operators, not identifiers
		if (first_child?.type === IDENTIFIER) {
			usages.push({ name: first_child.text, node: atRule })
		}
	})

	return usages
}
