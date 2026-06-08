const STRING_REGEX = /^\/(.+)\/(i?)$/
const parsed_cache = new WeakMap<Array<string | RegExp>, Array<string | RegExp>>()

function parse_allow_list(allow_list: Array<string | RegExp>): Array<string | RegExp> {
	let cached = parsed_cache.get(allow_list)
	if (cached !== undefined) return cached
	cached = allow_list.map((raw) => {
		if (typeof raw !== 'string') return raw
		const match = STRING_REGEX.exec(raw)
		if (!match) return raw
		return new RegExp(match[1], match[2] || undefined)
	})
	parsed_cache.set(allow_list, cached)
	return cached
}

export function is_allowed(value: string, allow_list: Array<string | RegExp>): boolean {
	const patterns = parse_allow_list(allow_list)
	for (let i = 0; i < patterns.length; i++) {
		const p = patterns[i]!
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
