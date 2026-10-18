// `report`, `ruleMessages` and `validateOptions` live under stylelint's
// public `./lib/utils/*` export, but TypeScript's "bundler" resolution stops
// falling back to plain JS inference for them because stylelint's main entry
// carries a "types" condition (making TS treat the whole package as
// self-typed, so every subpath needs its own declaration). Re-check these
// shapes against node_modules/stylelint/lib/utils/*.mjs whenever the
// `stylelint` peer range in package.json changes.

declare module 'stylelint/lib/utils/report.mjs' {
	import type { Problem } from 'stylelint'
	export default function report(problem: Problem): void
}

declare module 'stylelint/lib/utils/ruleMessages.mjs' {
	export default function ruleMessages<T extends Record<string, unknown>>(
		ruleName: string,
		messages: T,
	): T
}

declare module 'stylelint/lib/utils/validateOptions.mjs' {
	import type { PostcssResult } from 'stylelint'
	export default function validateOptions(
		result: PostcssResult,
		ruleName: string,
		...optionDescriptions: unknown[]
	): boolean
}
