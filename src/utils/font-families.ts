import { parse_value } from '@projectwallace/css-parser/parse-value'
import {
	is_function,
	is_identifier,
	is_operator,
	is_string,
	type CSSNode,
} from '@projectwallace/css-parser'
import { unquote } from './unquote.js'

function collect(nodes: Iterable<CSSNode>, deep: boolean, families: string[]) {
	let words: string[] = []

	function flush() {
		if (words.length > 0) {
			families.push(words.join(' '))
			words = []
		}
	}

	for (const node of nodes) {
		if (is_operator(node) && node.text === ',') {
			flush()
		} else if (is_identifier(node)) {
			words.push(node.text)
		} else if (is_string(node)) {
			words.push(unquote(node.text).trim().replaceAll(/\s+/g, ' '))
		} else if (is_function(node)) {
			if (deep) {
				// Look inside var() fallbacks and the like
				flush()
				collect(node.children, deep, families)
			} else {
				words.push(node.text)
			}
		}
	}
	flush()
}

/**
 * Split a `font-family` value into its individual family names.
 * Quotes are removed and whitespace in unquoted names is collapsed.
 * Commas inside quotes or functions do not split. Generic keywords are NOT filtered out.
 *
 * With `deep`, the arguments of functions such as `var(--font, Inter)` are
 * split as well instead of being returned as a single entry.
 */
export function split_font_families(value: string, deep = false): string[] {
	const families: string[] = []
	collect(parse_value(value).children, deep, families)
	return families
}
