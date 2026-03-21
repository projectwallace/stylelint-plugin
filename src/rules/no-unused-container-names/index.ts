import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	collect_declared_container_names,
	collect_container_name_usages,
} from '../../utils/container-names.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) =>
		`Container name "${name}" was declared but never used in a @container query`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-container-names/README.md',
}

interface SecondaryOptions {
	allowList?: Array<string | RegExp>
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
		const used_names = new Set(collect_container_name_usages(root).map((u) => u.name))

		for (const [name, node] of declared_names) {
			if (used_names.has(name)) continue

			if (secondaryOptions?.allowList) {
				const allowed = secondaryOptions.allowList.some(
					(pattern) =>
						(typeof pattern === 'string' && pattern === name) ||
						(pattern instanceof RegExp && pattern.test(name)),
				)
				if (allowed) continue
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(name),
				node,
				word: name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
