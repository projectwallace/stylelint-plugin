export function isAllowed(value: string, allowList: Array<string | RegExp>): boolean {
	return allowList.some(
		(pattern) =>
			(typeof pattern === 'string' && pattern === value) ||
			(pattern instanceof RegExp && pattern.test(value)),
	)
}

export const ignoreOptionValidators: Array<(v: unknown) => boolean> = [
	String as unknown as (v: unknown) => boolean,
	(v: unknown) => v instanceof RegExp,
]
