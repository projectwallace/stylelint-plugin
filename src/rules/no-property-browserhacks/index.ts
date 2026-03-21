import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_declaration } from '@projectwallace/css-parser/parse-declaration'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-property-browserhacks'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Property "${property}" is a browserhack and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-property-browserhacks/README.md',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkDecls((declaration) => {
			const full_declaration = root.source!.input.css.substring(
				declaration.source!.start!.offset,
				declaration.source!.end!.offset,
			)
			const parsed = parse_declaration(full_declaration)

			if (parsed.is_browserhack) {
				utils.report({
					message: messages.rejected(parsed.property!),
					node: declaration,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
