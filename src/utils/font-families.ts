/**
 * Split a `font-family` value into its individual family names.
 * Quotes are removed, whitespace is collapsed, commas inside quotes or
 * parentheses do not split. Generic keywords are NOT filtered out.
 */
export function split_font_families(value: string): string[] {
	const families: string[] = []
	let current = ''
	let quote: string | undefined
	let depth = 0

	function flush() {
		const name = current.trim().replaceAll(/\s+/g, ' ')
		if (name) families.push(name)
		current = ''
	}

	for (const char of value) {
		if (quote) {
			if (char === quote) {
				quote = undefined
			} else {
				current += char
			}
		} else if (char === '"' || char === "'") {
			quote = char
		} else if (char === '(') {
			depth++
			current += char
		} else if (char === ')') {
			depth--
			current += char
		} else if (char === ',' && depth === 0) {
			flush()
		} else {
			current += char
		}
	}
	flush()
	return families
}
