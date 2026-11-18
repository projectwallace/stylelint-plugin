import stylelint from 'stylelint'
import type { Root, Declaration, AtRule } from 'postcss'
import { get_property_name } from '@projectwallace/css-analyzer/atrules'
import { get_var_references } from '@projectwallace/css-analyzer/values'
import { is_allowed } from '../../utils/option-validators.js'
import { collect_usages_from_files } from '../../utils/import-from.js'
import type { ImportFrom } from '../../utils/import-from.js'
import { DefinedUsed } from '@projectwallace/css-analyzer/utils/collections'
import { is_custom } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unused-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Unexpected unused custom property "${property}"`,
})

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
			for (const { value } of get_var_references(decl.value)) {
				tracker.use(value)
			}
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
			const property_name = get_property_name(atRule.params)?.value
			if (property_name && is_custom(property_name)) {
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

		for (const [prop, node] of tracker.unused_definitions()) {
			if (!node) {
				continue
			}
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

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
