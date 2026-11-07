import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { IDENTIFIER, OPERATOR } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { keywords } from '@projectwallace/css-analyzer/values'
import { is_allowed } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'
import { walk_atrules, walk_decls } from '../../utils/walk.js'

function collect_container_names(root: Root, declared: Set<string>): void {
	walk_decls(root, ['container-name', 'container'], (decl) => {
		if (keywords.has(decl.value.trim())) {
			return
		}
		const ast = parse_value(decl.value)
		for (const node of ast) {
			if (node.type === OPERATOR) {
				break
			}
			if (node.type === IDENTIFIER) {
				declared.add(node.text)
			}
		}
	})
}

const { utils } = stylelint

const rule_name = 'projectwallace/no-unknown-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected unknown container name "${name}"`,
})

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
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

		const declared_names = new Set<string>()

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const root_node of [root, ...referenceRoots]) {
			collect_container_names(root_node, declared_names)
		}

		walk_atrules(root, ['container'], (atRule) => {
			const prelude = parse_atrule_prelude('container', atRule.params.trim())
			const first_child = prelude.at(0)?.first_child
			if (first_child?.type !== IDENTIFIER) {
				return
			}
			const name = first_child.text
			if (declared_names.has(name)) {
				return
			}
			if (secondaryOptions?.ignore && is_allowed(name, secondaryOptions.ignore)) {
				return
			}
			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(name),
				node: atRule,
				word: name,
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
