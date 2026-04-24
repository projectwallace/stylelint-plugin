import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { collect_declared_properties, collect_var_usages } from '../../utils/custom-properties.js'
import { isAllowed } from '../../utils/allow-list.js'
import { collect_usages_from_files } from '../../utils/import-from.js'
import type { ImportFrom } from '../../utils/import-from.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `"${property}" was declared but never used in a var()`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-custom-properties/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
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
		const used_names = new Set(collect_var_usages(root).map((u) => u.name))

		if (secondaryOptions?.importFrom?.length) {
			for (const name of collect_usages_from_files(secondaryOptions.importFrom)) {
				used_names.add(name)
			}
		}

		for (const [prop, node] of declared_properties) {
			if (used_names.has(prop)) continue

			if (secondaryOptions?.ignore && isAllowed(prop, secondaryOptions.ignore)) continue

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(prop),
				node,
				word: prop,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
