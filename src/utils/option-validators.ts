const STRING_REGEX = /^\/(.+)\/(i?)$/

function parse_string_or_regex(pattern: string | RegExp): string | RegExp {
	if (typeof pattern !== 'string') return pattern
	const match = STRING_REGEX.exec(pattern)
	if (!match) return pattern
	return new RegExp(match[1], match[2] || undefined)
}

export function is_allowed(value: string, allow_list: Array<string | RegExp>): boolean {
	for (const raw of allow_list) {
		const p = parse_string_or_regex(raw)
		if (typeof p === 'string' ? p === value : p instanceof RegExp && p.test(value)) return true
	}
	return false
}

export const ignore_option_validators: Array<(v: unknown) => boolean> = [
	String as unknown as (v: unknown) => boolean,
	(v: unknown) => v instanceof RegExp,
]

export function is_valid_positive_integer(v: unknown): boolean {
	return Number.isInteger(v) && (v as number) > 0
}

export function is_valid_non_negative_integer(v: unknown): boolean {
	return Number.isInteger(v) && (v as number) >= 0
}

export function is_valid_ratio(v: unknown): boolean {
	return Number.isFinite(v) && (v as number) >= 0 && (v as number) <= 1
}
