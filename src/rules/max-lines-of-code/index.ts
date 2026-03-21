import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { analyze } from '@projectwallace/css-analyzer'
import { CrossFileAccumulator } from '../../utils/cross-file-accumulator.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-lines-of-code'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Counted ${actual} Lines of Code which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-lines-of-code/README.md',
}

// Accumulates per-file SLOC across all files in a single stylelint run so the
// limit is enforced on the combined total rather than on each file individually.
// Export allows tests to reset state between lint runs.
export const accumulator = new CrossFileAccumulator<number>()

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		const filePath = root.source?.input.file
		const analysis = analyze(root.toString())
		const fileSloc = analysis.stylesheet.sourceLinesOfCode

		if (!filePath) {
			// No file path (e.g., inline code passed via `code:` option) — fall back
			// to per-file check so that isolated usage and tests behave as expected.
			if (fileSloc > primaryOption) {
				utils.report({
					message: messages.rejected(fileSloc, primaryOption),
					node: root,
					result,
					ruleName: rule_name,
				})
			}
			return
		}

		// Cross-file: record this file's SLOC and check the running total.
		// Capture the total BEFORE this file is recorded so we can detect the
		// exact moment the combined total crosses the threshold and report only once.
		const previousTotal = accumulator.values().reduce((sum, n) => sum + n, 0)
		accumulator.update(filePath, fileSloc)
		const totalSloc = accumulator.values().reduce((sum, n) => sum + n, 0)

		if (totalSloc > primaryOption && previousTotal <= primaryOption) {
			utils.report({
				message: messages.rejected(totalSloc, primaryOption),
				node: root,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
