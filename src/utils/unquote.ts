const SINGLE_QUOTE = 39
const DOUBLE_QUOTE = 34

function is_quote(code: number): boolean {
	return code === SINGLE_QUOTE || code === DOUBLE_QUOTE
}

/** Strip a leading and/or trailing quote character (each independently). */
export function unquote(value: string): string {
	const start = value.length > 0 && is_quote(value.charCodeAt(0)) ? 1 : 0
	const end =
		value.length > start && is_quote(value.charCodeAt(value.length - 1))
			? value.length - 1
			: value.length
	return start === 0 && end === value.length ? value : value.slice(start, end)
}
