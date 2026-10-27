import stylelint from 'stylelint'
import type { Root, Declaration, AtRule } from 'postcss'
import { FUNCTION, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk } from '@projectwallace/css-parser/walker'
import { is_allowed } from '../../utils/option-validators.js'
import { collect_usages_from_files } from '../../utils/import-from.js'
import type { ImportFrom } from '../../utils/import-from.js'
import { DefinedUsed } from '../../utils/defined-used.js'
import { is_custom, str_equals } from '@projectwallace/css-parser/string-utils'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Unexpected unused custom property "${property}"`,
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

		const tracker = new DefinedUsed<Declaration | AtRule>()

		function collect_var_usages(decl: Declaration) {
			walk(parse_value(decl.value), (node) => {
				if (node.type !== FUNCTION || !str_equals('var', node.name)) {
					return
				}
				const first = node.first_child
				if (first !== null && first.type === IDENTIFIER && is_custom(first.text)) {
					tracker.use(first.text)
				}
			})
		}

		// Declarations are visited first so they take precedence over @property
		// when both exist for the same name — also collects var() usages in one pass
		root.walkDecls((decl) => {
			if (is_custom(decl.prop)) {
				tracker.define(decl.prop, decl)
			}
			collect_var_usages(decl)
		})

		root.walkAtRules(/^property$/i, (atRule) => {
			const property_name = atRule.params.trim()
			if (is_custom(property_name)) {
				tracker.define(property_name, atRule)
			}
		})

		if (secondaryOptions?.importFrom?.length) {
			for (const name of collect_usages_from_files(secondaryOptions.importFrom)) {
				tracker.use(name)
			}
		}

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const referenceRoot of referenceRoots) {
			referenceRoot.walkDecls(collect_var_usages)
		}

		for (const [prop, node] of tracker.unused()) {
			if (secondaryOptions?.ignore && is_allowed(prop, secondaryOptions.ignore)) {
				continue
			}

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
