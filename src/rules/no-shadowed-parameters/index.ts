import stylelint from 'stylelint'
import type { Root, Container } from 'postcss'
import { get_definitions } from '../../utils/function-mixin.js'
import { is_custom } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-shadowed-parameters'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string, owner: string) =>
		`Unexpected local variable "${name}" that shadows a parameter of ${owner}`,
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

		for (const definition of get_definitions(root)) {
			const names = new Set(definition.params.map((parameter) => parameter.name))
			if (names.size === 0) {
				continue
			}
			const check = (container: Container) =>
				container.walkDecls((declaration) => {
					if (is_custom(declaration.prop) && names.has(declaration.prop)) {
						report(
							declaration,
							messages.rejected(declaration.prop, `@${definition.kind} ${definition.name}`),
							{ word: declaration.prop },
						)
					}
				})
			if (definition.kind === 'function') {
				check(definition.node)
			} else {
				// In a mixin only @private properties shadow a parameter
				definition.node.walkAtRules(/^private$/i, check)
			}
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
