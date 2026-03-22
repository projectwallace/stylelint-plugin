import fs from 'node:fs'
import {
	parse,
	walk,
	DECLARATION,
	AT_RULE,
	FUNCTION,
	IDENTIFIER,
	OPERATOR,
	type CSSNode,
} from '@projectwallace/css-parser'

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
		const ast = parse(css)
		walk(ast, (node: CSSNode) => {
			if (node.type === DECLARATION) {
				const prop = node.property
				if (typeof prop === 'string' && prop.startsWith('--')) {
					result.add(prop)
				}
			} else if (node.type === AT_RULE && node.name === 'property' && node.prelude) {
				walk(node.prelude, (child: CSSNode) => {
					if (child.type === IDENTIFIER && child.text.startsWith('--')) {
						result.add(child.text)
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
		const ast = parse(css)
		walk(ast, (node: CSSNode) => {
			if (node.type === FUNCTION && node.name === 'var') {
				for (const child of node.children) {
					if (child.type === IDENTIFIER && child.text.startsWith('--')) {
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
