import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector, walk, BREAK } from '@projectwallace/css-parser'
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-prefixed-selectors'

const messages = utils.ruleMessages(rule_name, {
	rejected: (selector: string) => `Selector "${selector}" is vendor-prefixed and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-prefixed-selectors/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{ actual: primaryOption, possible: [true] },
			{
				actual: secondaryOptions,
				possible: { ignore: ignore_option_validators },
				optional: true,
			},
		)

		if (!validOptions) return

		const ignore = secondaryOptions?.ignore ?? []

		root.walkRules((rule) => {
			const selector_text = rule.selector
			if (!selector_text.trim()) return

			const selector_list = parse_selector(selector_text)

			for (const selector of selector_list.children) {
				walk(selector, (node) => {
					if (node.is_vendor_prefixed && !is_allowed(node.text, ignore)) {
						utils.report({
							message: messages.rejected(selector.text),
							node: rule,
							result,
							ruleName: rule_name,
							word: node.text,
						})
						return BREAK
					}
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
