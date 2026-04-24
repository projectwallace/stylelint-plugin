import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	collect_declared_container_names,
	collect_container_name_usages,
} from '../../utils/container-names.js'
import { isAllowed } from '../../utils/allow-list.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unknown-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) =>
		`Container name "${name}" is used in a @container query but was never declared`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unknown-container-names/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
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

		const declared_names = collect_declared_container_names(root)
		const usages = collect_container_name_usages(root)

		for (const usage of usages) {
			if (declared_names.has(usage.name)) continue

			if (secondaryOptions?.ignore && isAllowed(usage.name, secondaryOptions.ignore)) continue

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
