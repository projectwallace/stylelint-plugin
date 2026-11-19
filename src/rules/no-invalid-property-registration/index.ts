import stylelint from 'stylelint'
import type { Root, AtRule, Declaration } from 'postcss'
import { validate_property_registration } from '@projectwallace/css-analyzer/atrules'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-invalid-property-registration'

const messages = utils.ruleMessages(rule_name, {
	invalid_name: (name: string) => `Expected @property name "${name}" to start with "--"`,
	missing_descriptor: (name: string, descriptor: string) =>
		`Expected @property "${name}" to define the "${descriptor}" descriptor`,
	missing_initial_value: (name: string, syntax: string) =>
		`Expected @property "${name}" to have an "initial-value" descriptor because its syntax is ${syntax}`,
	invalid_syntax: (name: string, syntax: string) =>
		`Expected "syntax" of @property "${name}" to be a quoted string but found [${syntax}]`,
	invalid_inherits: (name: string, value: string) =>
		`Expected "inherits" of @property "${name}" to be "true" or "false" but found [${value}]`,
	dependent_initial_value: (name: string, value: string) =>
		`Expected "initial-value" of @property "${name}" to be computationally independent but found [${value}]`,
	mismatched_initial_value: (name: string, value: string, syntax: string) =>
		`Expected "initial-value" [${value}] of @property "${name}" to match syntax ${syntax}`,
})

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkAtRules(/^property$/i, (at_rule) => {
			const name = at_rule.params.trim()
			if (!name) {
				return
			}

			// No prototype, so a descriptor named `__proto__` or `constructor` can't clash with Object.prototype
			const descriptors: Record<string, string> = Object.create(null)
			const nodes: Record<string, Declaration> = Object.create(null)
			at_rule.each((child) => {
				if (child.type === 'decl') {
					const prop = child.prop.toLowerCase()
					descriptors[prop] = child.value
					nodes[prop] = child
				}
			})

			for (const issue of validate_property_registration(name, descriptors)) {
				switch (issue.type) {
					case 'invalid_name':
						report(messages.invalid_name(name))
						break
					case 'missing_descriptor':
						report(messages.missing_descriptor(name, issue.descriptor))
						break
					case 'missing_initial_value':
						report(messages.missing_initial_value(name, `"${issue.syntax}"`))
						break
					case 'invalid_syntax':
						report(messages.invalid_syntax(name, issue.value), nodes['syntax'])
						break
					case 'invalid_inherits':
						report(messages.invalid_inherits(name, issue.value), nodes['inherits'])
						break
					case 'dependent_initial_value':
						report(messages.dependent_initial_value(name, issue.value), nodes['initial-value'])
						break
					case 'mismatched_initial_value':
						report(
							messages.mismatched_initial_value(name, issue.value, `"${issue.syntax}"`),
							nodes['initial-value'],
						)
						break
				}
			}

			function report(message: string, node: AtRule | Declaration = at_rule) {
				utils.report({ result, ruleName: rule_name, message, node })
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
