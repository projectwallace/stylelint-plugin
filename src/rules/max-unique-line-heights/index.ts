import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { destructureFontShorthand, keywords } from '@projectwallace/css-analyzer/values'
import {
	is_allowed,
	is_valid_non_negative_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'
import { walk_decls } from '../../utils/walk.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-line-heights'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique line heights but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-line-heights/README.md',
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
			[is_valid_non_negative_integer],
		)

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique_heights = new UniqueTracker(primaryOption)
		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		walk_decls(root, ['line-height'], (declaration) => {
			unique_heights.begin()
			if (!keywords.has(declaration.value) && !is_allowed(declaration.value, ignore)) {
				unique_heights.add(declaration.value)
			}
			if (unique_heights.exceeded()) {
				violating_declarations.push({ declaration, word: declaration.value })
			}
		})

		walk_decls(root, ['font'], (declaration) => {
			unique_heights.begin()
			const parsed = parse_value(declaration.value)
			const destructured = destructureFontShorthand(parsed, () => {})
			if (destructured?.line_height && !is_allowed(destructured.line_height, ignore)) {
				unique_heights.add(destructured.line_height)
			}
			if (unique_heights.exceeded()) {
				violating_declarations.push({
					declaration,
					word: destructured?.line_height ?? declaration.value,
				})
			}
		})

		const actual = unique_heights.size
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
