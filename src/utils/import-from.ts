import fs from 'node:fs'
import {
	DECLARATION,
	AT_RULE,
	FUNCTION,
	IDENTIFIER,
	OPERATOR,
} from '@projectwallace/css-parser/nodes'
import { parse } from '@projectwallace/css-parser/parse'
import { SKIP, walk } from '@projectwallace/css-parser/walker'
import { is_custom, str_equals } from '@projectwallace/css-parser/string-utils'

export type ImportFrom = string | { filePath: string }

function get_file_path(entry: ImportFrom): string {
	return typeof entry === 'string' ? entry : entry.filePath
}

/**
 * Reads CSS files and returns all custom property declarations found in them.
 * Used by rules that need to know about properties declared in other files
 * (e.g. a tokens file) when linting a file that uses those properties.
 */
export function collect_declarations_from_files(importFrom: ImportFrom[]): Set<string> {
	const result = new Set<string>()
	for (const entry of importFrom) {
		const file_path = get_file_path(entry)
		const css = fs.readFileSync(file_path, 'utf8')
		const ast = parse(css, {
			parse_selectors: false,
			parse_values: false,
		})
		walk(ast, (node) => {
			if (node.type === DECLARATION) {
				const property = node.property
				if (typeof property === 'string' && is_custom(property)) {
					result.add(property)
					return SKIP
				}
			} else if (node.type === AT_RULE && str_equals('property', node.name) && node.prelude) {
				walk(node.prelude, (child) => {
					if (child.type === IDENTIFIER && is_custom(child.text)) {
						result.add(child.text)
						return SKIP
					}
				})
			}
		})
	}
	return result
}

/**
 * Reads CSS files and returns the names of all custom properties used via var()
 * in them. Used by rules that need to know about usages in other files (e.g.
 * component files) when linting a file that declares those properties.
 */
export function collect_usages_from_files(importFrom: ImportFrom[]): Set<string> {
	const result = new Set<string>()
	for (const entry of importFrom) {
		const file_path = get_file_path(entry)
		const css = fs.readFileSync(file_path, 'utf8')
		const ast = parse(css, {
			parse_atrule_preludes: false,
			parse_selectors: false,
		})
		walk(ast, (node) => {
			if (node.type === FUNCTION && str_equals('var', node.name)) {
				for (const child of node) {
					if (child.type === IDENTIFIER && is_custom(child.text)) {
						result.add(child.text)
						break
					}
					if (child.type === OPERATOR) break
				}
			}
		})
	}
	return result
}
