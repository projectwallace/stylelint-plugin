// Rules only ever need `createPlugin` and a few `utils` functions off the
// `stylelint` package, but importing the bare package (`import stylelint from
// 'stylelint'`) pulls in `standalone.mjs` and everything behind it (globby,
// cosmiconfig, write-file-atomic, ...), which don't bundle for non-Node
// targets like the browser. `createPlugin` is trivial to reimplement, and the
// three `utils` functions actually used live under stylelint's public
// `./lib/utils/*` export, so importing them directly avoids the bare
// specifier entirely.
import report from 'stylelint/lib/utils/report.mjs'
import ruleMessages from 'stylelint/lib/utils/ruleMessages.mjs'
import validateOptions from 'stylelint/lib/utils/validateOptions.mjs'
import type { Rule } from 'stylelint'

export function createPlugin(ruleName: string, rule: Rule) {
	return { ruleName, rule }
}

export const utils = { report, ruleMessages, validateOptions }
