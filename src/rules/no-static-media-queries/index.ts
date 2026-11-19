import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_static_features } from '@projectwallace/css-analyzer/atrules'
import { str_equals } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'
import { get_params_offset } from '../../utils/offsets.js'

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
			const prelude = at_rule.params
			if (!prelude) {
				return
			}

			const [static_feature] = get_static_features(
				prelude,
				str_equals('import', at_rule.name) ? 'import' : 'media',
			)
			if (static_feature) {
				const params_offset = get_params_offset(at_rule)
				utils.report({
					message: messages.rejected(),
					node: at_rule,
					index: params_offset + static_feature.start_offset,
					endIndex: params_offset + static_feature.end_offset,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
