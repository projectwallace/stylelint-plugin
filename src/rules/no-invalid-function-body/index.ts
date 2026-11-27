import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_definitions } from '../../utils/function-mixin.js'
import { is_custom } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-invalid-function-body'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) =>
		`Unexpected property "${property}" in @function, only result and custom properties are valid`,
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

		const report = (
			node: Parameters<typeof utils.report>[0]['node'],
			message: string,
			location: { word?: string; index?: number; endIndex?: number } = {},
		) => utils.report({ result, ruleName: rule_name, message, node, ...location })

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions

		for (const definition of get_definitions(root, 'function')) {
			definition.node.walkDecls((declaration) => {
				if (!is_custom(declaration.prop) && declaration.prop.toLowerCase() !== 'result') {
					report(declaration, messages.rejected(declaration.prop), { word: declaration.prop })
				}
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
