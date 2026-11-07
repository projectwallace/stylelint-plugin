import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import {
	is_allowed,
	is_valid_positive_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { analyzeAnimation } from '@projectwallace/css-analyzer/values'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { OPERATOR } from '@projectwallace/css-parser'
import { str_equals } from '@projectwallace/css-parser/string-utils'
import { UniqueTracker } from '../../utils/unique-tracker.js'
import { walk_decls } from '../../utils/walk.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-animation-functions'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique animation-functions but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-animation-functions/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = validate_options_with_ignore(
			result,
			rule_name,
			primaryOption,
			secondaryOptions,
			[is_valid_positive_integer],
		)

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique_functions = new UniqueTracker(primaryOption)
		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		walk_decls(
			root,
			['animation-timing-function', 'animation', 'transition-timing-function', 'transition'],
			(declaration) => {
				let parsed = parse_value(declaration.value)
				unique_functions.begin()
				let triggering_fn = declaration.value

				if (
					str_equals('animation-timing-function', declaration.prop) ||
					str_equals('transition-timing-function', declaration.prop)
				) {
					for (let child of parsed) {
						if (child.type !== OPERATOR) {
							let fn = child.text
							if (!is_allowed(fn, ignore)) {
								if (unique_functions.add(fn)) {
									triggering_fn = fn
								}
							}
						}
					}
				} else {
					analyzeAnimation(parsed, function (item) {
						if (item.type === 'fn') {
							let fn = item.value.text
							if (!is_allowed(fn, ignore)) {
								if (unique_functions.add(fn)) {
									triggering_fn = fn
								}
							}
						}
					})
				}

				if (unique_functions.exceeded()) {
					violating_declarations.push({ declaration, word: triggering_fn })
				}
			},
		)

		const actual = unique_functions.size
		for (const { declaration, word } of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: declaration,
				word,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
