import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { collect_declared_properties, collect_var_usages } from '../../utils/custom-properties.js'
import { collect_declarations_from_files } from '../../utils/import-from.js'
import type { ImportFrom } from '../../utils/import-from.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unknown-custom-property'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `"${property}" is used in a var() but was never declared`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unknown-custom-property/README.md',
}

interface SecondaryOptions {
	allowFallback?: boolean
	allowList?: Array<string | RegExp>
	importFrom?: ImportFrom[]
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const declared_properties = collect_declared_properties(root)

		const imported_properties = secondaryOptions?.importFrom?.length
			? collect_declarations_from_files(secondaryOptions.importFrom)
			: null

		const usages = collect_var_usages(root)

		for (const usage of usages) {
			if (declared_properties.has(usage.name)) continue
			if (imported_properties?.has(usage.name)) continue
			if (secondaryOptions?.allowFallback && usage.has_fallback) continue
			if (secondaryOptions?.allowList) {
				const allowed = secondaryOptions.allowList.some(
					(pattern) =>
						(typeof pattern === 'string' && pattern === usage.name) ||
						(pattern instanceof RegExp && pattern.test(usage.name)),
				)
				if (allowed) continue
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(usage.name),
				node: usage.node,
				word: usage.name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
