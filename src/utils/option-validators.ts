import stylelint from 'stylelint'

const STRING_REGEX = /^\/(.+)\/(i?)$/

function parse_string_or_regex(pattern: string | RegExp): string | RegExp {
	if (typeof pattern !== 'string') {
		return pattern
	}
	const match = STRING_REGEX.exec(pattern)
	if (!match) {
		return pattern
	}
	return new RegExp(match[1], match[2] || undefined)
}

export function is_allowed(value: string, allow_list: Array<string | RegExp>): boolean {
	for (const raw of allow_list) {
		const p = parse_string_or_regex(raw)
		if (typeof p === 'string' ? p === value : p instanceof RegExp && p.test(value)) {
			return true
		}
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

/**
 * Validate the common option shape: a primary option plus an optional `{ ignore: [...] }` secondary option.
 * @param primary_possible - the stylelint `possible` list for the primary option, e.g. `[is_valid_positive_integer]`
 */
export function validate_options_with_ignore(
	result: stylelint.PostcssResult,
	rule_name: string,
	primary_option: unknown,
	secondary_options: unknown,
	primary_possible: stylelint.RuleOptionsPossible[],
): boolean {
	return stylelint.utils.validateOptions(
		result,
		rule_name,
		{ actual: primary_option, possible: primary_possible },
		{
			actual: secondary_options,
			possible: { ignore: ignore_option_validators },
			optional: true,
		},
	)
}
