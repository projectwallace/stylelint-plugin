import stylelint from 'stylelint'
import type { Root, Declaration, AtRule } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { destructureFontShorthand, keywords } from '@projectwallace/css-analyzer/values'
import {
	is_allowed,
	is_valid_non_negative_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { str_equals } from '@projectwallace/css-parser/string-utils'
import { UniqueTracker } from '../../utils/unique-tracker.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-font-families'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique font families but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-font-families/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

function noop() {}

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
		const unique_families = new UniqueTracker(primaryOption)
		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		root.walkDecls(/^font-family$/i, (declaration) => {
			if (
				declaration.parent?.type === 'atrule' &&
				str_equals('font-face', (declaration.parent as AtRule).name)
			) {
				return
			}
			unique_families.begin()
			if (!keywords.has(declaration.value) && !is_allowed(declaration.value, ignore)) {
				unique_families.add(declaration.value)
			}
			if (unique_families.exceeded()) {
				violating_declarations.push({ declaration, word: declaration.value })
			}
		})

		root.walkDecls(/^font$/i, (declaration) => {
			unique_families.begin()
			const parsed = parse_value(declaration.value)
			const destructured = destructureFontShorthand(parsed, noop)
			if (destructured?.font_family && !is_allowed(destructured.font_family, ignore)) {
				unique_families.add(destructured.font_family)
			}
			if (unique_families.exceeded()) {
				violating_declarations.push({
					declaration,
					word: destructured?.font_family ?? declaration.value,
				})
			}
		})

		const actual = unique_families.size
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
