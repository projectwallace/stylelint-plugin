import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { FUNCTION, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk } from '@projectwallace/css-parser/walker'
import { collect_declarations_from_files } from '../../utils/import-from.js'
import type { ImportFrom } from '../../utils/import-from.js'
import { is_allowed } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unknown-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Unexpected unknown custom property "${property}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unknown-custom-properties/README.md',
}

interface SecondaryOptions {
	allowFallback?: boolean
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

		const declared_properties = new Set<string>()

		root.walkAtRules('property', (atRule) => {
			const property_name = atRule.params.trim()
			if (property_name.startsWith('--')) {
				declared_properties.add(property_name)
			}
		})

		root.walkDecls((decl) => {
			if (decl.prop.startsWith('--')) {
				declared_properties.add(decl.prop)
			}
		})

		if (secondaryOptions?.importFrom?.length) {
			for (const name of collect_declarations_from_files(secondaryOptions.importFrom)) {
				declared_properties.add(name)
			}
		}

		root.walkDecls((decl) => {
			walk(parse_value(decl.value), (node) => {
				if (node.type !== FUNCTION || node.name !== 'var') {
					return
				}
				const first = node.first_child
				if (first === null || first.type !== IDENTIFIER || !first.text.startsWith('--')) {
					return
				}
				const name = first.text
				const has_fallback = first.next_sibling !== null
				if (declared_properties.has(name)) {
					return
				}
				if (secondaryOptions?.allowFallback && has_fallback) {
					return
				}
				if (secondaryOptions?.ignore && is_allowed(name, secondaryOptions.ignore)) {
					return
				}
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: decl,
					word: name,
				})
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
