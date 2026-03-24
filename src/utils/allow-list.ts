/**
 * Check if a given value matches any pattern in an allowList.
 * Each pattern can be an exact string or a RegExp.
 */
export function isAllowed(value: string, allowList: Array<string | RegExp>): boolean {
	return allowList.some(
		(pattern) =>
			(typeof pattern === 'string' && pattern === value) ||
			(pattern instanceof RegExp && pattern.test(value)),
	)
}
