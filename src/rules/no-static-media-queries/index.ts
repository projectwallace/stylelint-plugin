import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_static_features } from '@projectwallace/css-analyzer/atrules'
import { define_rule } from '../../utils/define-rule.js'
import { parse_prelude_of } from '../../utils/parse.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-static-media-queries'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected static value in media query`,
})

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkAtRules(/^(media|import)$/i, (at_rule) => {
			const prelude = parse_prelude_of(at_rule)
			if (!prelude) {
				return
			}

			// Features in a query with `not` or `or` are too complex to judge
			const static_feature = get_static_features(prelude).find((feature) => !feature.complex)
			if (static_feature) {
				utils.report({
					message: messages.rejected(),
					node: at_rule,
					index: static_feature.start_offset,
					endIndex: static_feature.end_offset,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
