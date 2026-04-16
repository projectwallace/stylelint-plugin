import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { IDENTIFIER, OPERATOR, STRING } from '@projectwallace/css-parser'
import { destructureFontShorthand } from '@projectwallace/css-analyzer/values'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-font-families'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, families: string[]) =>
		`Found ${actual} unique font families (${families.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-font-families/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		const unique_families = new Set<string>()

		/**
		 * Parse a font-family list string and add each individual font family
		 * to the unique_families set. Font families are comma-separated; unquoted
		 * multi-word names (e.g. "Times New Roman") are made up of consecutive
		 * IDENTIFIER tokens that are joined with a space.
		 */
		function collect_font_families(parsed: ReturnType<typeof parse_value>): void {
			if (!parsed.has_children) return

			let current_identifiers: string[] = []

			for (const child of parsed) {
				if (child.type === OPERATOR) {
					// Comma — flush the current accumulated name
					if (current_identifiers.length > 0) {
						unique_families.add(current_identifiers.join(' '))
						current_identifiers = []
					}
				} else if (child.type === IDENTIFIER) {
					current_identifiers.push(child.text)
				} else if (child.type === STRING) {
					// Quoted font name — flush any pending identifiers first (shouldn't
					// normally mix, but be defensive), then add the quoted string.
					if (current_identifiers.length > 0) {
						unique_families.add(current_identifiers.join(' '))
						current_identifiers = []
					}
					unique_families.add(child.text)
				}
			}

			// Flush the last accumulated name
			if (current_identifiers.length > 0) {
				unique_families.add(current_identifiers.join(' '))
			}
		}

		root.walkDecls('font-family', (declaration) => {
			collect_font_families(parse_value(declaration.value))
		})

		root.walkDecls('font', (declaration) => {
			const parsed = parse_value(declaration.value)
			const destructured = destructureFontShorthand(parsed, () => {})
			if (destructured?.font_family) {
				collect_font_families(parse_value(destructured.font_family))
			}
		})

		const actual = unique_families.size

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_families]),
				node: root,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
