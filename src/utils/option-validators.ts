function parse_string_or_regex(pattern: string | RegExp): string | RegExp {
	if (typeof pattern !== 'string') return pattern
	const match = pattern.match(/^\/(.+)\/(i?)$/)
	if (!match) return pattern
	return new RegExp(match[1], match[2] || undefined)
}

export function is_allowed(value: string, allow_list: Array<string | RegExp>): boolean {
	return allow_list.some((raw) => {
		const pattern = parse_string_or_regex(raw)
		return typeof pattern === 'string'
			? pattern === value
			: pattern instanceof RegExp && pattern.test(value)
	})
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
