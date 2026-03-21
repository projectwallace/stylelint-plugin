import type { Root, Declaration, AtRule } from 'postcss'
import { parse_value, OPERATOR, IDENTIFIER } from '@projectwallace/css-parser'
import { cssKeywords } from '@projectwallace/css-analyzer'

export function collect_declared_container_names(root: Root): Map<string, Declaration> {
	const names = new Map<string, Declaration>()

	root.walkDecls(/^container(-name)?$/i, (decl) => {
		let value = decl.value.trim()

		// Skip `none` - not a real container name
		if (cssKeywords.has(value)) return

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

		// If it starts with `(`, `not`, `style(`, it's an anonymous container query
		if (/^\(|^not[\s(]|^style\s*\(|^and[\s(]|^or[\s(]/.test(params)) return

		// Extract the container name (first identifier before whitespace or `(`)
		const match = params.match(/^([\w-]+)/)
		if (match && match[1].toLowerCase() !== 'none') {
			usages.push({ name: match[1], node: atRule })
		}
	})

	return usages
}
