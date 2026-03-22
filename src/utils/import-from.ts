import fs from 'node:fs'
import postcss from 'postcss'
import type { Declaration, AtRule } from 'postcss'
import { collect_declared_properties, collect_var_usages } from './custom-properties.js'

export type ImportFrom = string | { filePath: string }

function get_file_path(entry: ImportFrom): string {
	return typeof entry === 'string' ? entry : entry.filePath
}

/**
 * Reads CSS files and returns all custom property declarations found in them.
 * Used by rules that need to know about properties declared in other files
 * (e.g. a tokens file) when linting a file that uses those properties.
 */
export function collect_declarations_from_files(
	importFrom: ImportFrom[],
): Map<string, Declaration | AtRule> {
	const result = new Map<string, Declaration | AtRule>()
	for (const entry of importFrom) {
		const file_path = get_file_path(entry)
		const css = fs.readFileSync(file_path, 'utf8')
		const root = postcss.parse(css)
		for (const [name, node] of collect_declared_properties(root)) {
			result.set(name, node)
		}
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
		const root = postcss.parse(css)
		for (const usage of collect_var_usages(root)) {
			result.add(usage.name)
		}
	}
	return result
}
