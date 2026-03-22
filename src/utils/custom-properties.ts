import type { Root, Declaration, AtRule } from 'postcss'
import { walk, FUNCTION, IDENTIFIER } from '@projectwallace/css-parser'
import { parse_declaration } from '@projectwallace/css-parser/parse-declaration'

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
		const decl_source = `${declaration.prop}: ${declaration.value}`
		const parsed = parse_declaration(decl_source)

		walk(parsed, (node) => {
			if (node.type === FUNCTION && node.name === 'var') {
				let found_name: string | null = null
				let has_fallback = false

				for (const child of node.children) {
					if (found_name === null && child.type === IDENTIFIER && child.text.startsWith('--')) {
						found_name = child.text
					} else if (found_name !== null) {
						has_fallback = true
						break
					}
				}

				if (found_name !== null) {
					usages.push({ name: found_name, has_fallback, node: declaration })
				}
			}
		})
	})

	return usages
}
