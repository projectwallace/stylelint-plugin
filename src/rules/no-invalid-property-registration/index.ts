import stylelint from 'stylelint'
import type { Root, AtRule, Declaration } from 'postcss'

const { createPlugin, utils } = stylelint

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

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-invalid-property-registration/README.md',
}

const NUMBER = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?`
const NUMBER_RE = new RegExp(`^${NUMBER}$`, 'i')
const INTEGER_RE = /^[+-]?\d+$/
const PERCENTAGE_RE = new RegExp(`^${NUMBER}%$`, 'i')

function dimension_re(units: string): RegExp {
	return new RegExp(`^${NUMBER}(?:${units})$`, 'i')
}

const LENGTH_RE = dimension_re(
	'px|em|rem|ex|rex|cap|rcap|ch|rch|ic|ric|lh|rlh|vw|vh|vmin|vmax|vi|vb|svw|svh|svi|svb|lvw|lvh|lvi|lvb|dvw|dvh|dvi|dvb|cm|mm|q|in|pt|pc|cqw|cqh|cqi|cqb|cqmin|cqmax',
)
const ANGLE_RE = dimension_re('deg|grad|rad|turn')
const TIME_RE = dimension_re('s|ms')
const RESOLUTION_RE = dimension_re('dpi|dpcm|dppx|x')
const FLEX_RE = dimension_re('fr')
const ZERO_RE = /^[+-]?0*\.?0+(?:e[+-]?\d+)?$/i

type Matcher = (value: string) => boolean

const MATCHERS: Record<string, Matcher> = {
	'<number>': (v) => NUMBER_RE.test(v),
	'<integer>': (v) => INTEGER_RE.test(v),
	'<percentage>': (v) => PERCENTAGE_RE.test(v),
	'<length>': (v) => LENGTH_RE.test(v) || ZERO_RE.test(v),
	'<length-percentage>': (v) => LENGTH_RE.test(v) || PERCENTAGE_RE.test(v) || ZERO_RE.test(v),
	'<angle>': (v) => ANGLE_RE.test(v) || ZERO_RE.test(v),
	'<time>': (v) => TIME_RE.test(v),
	'<resolution>': (v) => RESOLUTION_RE.test(v),
	'<flex>': (v) => FLEX_RE.test(v),
	// A color is never a bare number, dimension or percentage
	'<color>': (v) =>
		!(NUMBER_RE.test(v) || PERCENTAGE_RE.test(v) || /^[+-]?[\d.]+[a-z%]+$/i.test(v)),
}

const QUOTED_RE = /^(["'])(.*)\1$/s

function get_descriptor(at_rule: AtRule, name: string): Declaration | undefined {
	let found: Declaration | undefined
	at_rule.each((child) => {
		if (child.type === 'decl' && child.prop.toLowerCase() === name) {
			found = child
		}
	})
	return found
}

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

			function report(message: string, node: AtRule | Declaration = at_rule) {
				utils.report({ result, ruleName: rule_name, message, node })
			}

			if (!name.startsWith('--')) {
				report(messages.invalid_name(name))
			}

			const syntax_decl = get_descriptor(at_rule, 'syntax')
			const inherits_decl = get_descriptor(at_rule, 'inherits')
			const initial_decl = get_descriptor(at_rule, 'initial-value')

			if (!syntax_decl) {
				report(messages.missing_descriptor(name, 'syntax'))
			}
			if (!inherits_decl) {
				report(messages.missing_descriptor(name, 'inherits'))
			}

			if (inherits_decl) {
				const value = inherits_decl.value.trim()
				if (!/^(true|false)$/i.test(value)) {
					report(messages.invalid_inherits(name, value), inherits_decl)
				}
			}

			let syntax: string | undefined
			if (syntax_decl) {
				const value = syntax_decl.value.trim()
				const quoted = QUOTED_RE.exec(value)
				if (quoted) {
					syntax = quoted[2].trim()
				} else {
					report(messages.invalid_syntax(name, value), syntax_decl)
				}
			}

			// Without a (valid) syntax we can't say anything about the initial value
			if (syntax === undefined) {
				return
			}

			if (!initial_decl) {
				if (syntax !== '*') {
					report(messages.missing_initial_value(name, `"${syntax}"`))
				}
				return
			}

			const initial_value = initial_decl.value.trim()
			if (/\bvar\(/i.test(initial_value)) {
				report(messages.dependent_initial_value(name, initial_value), initial_decl)
				return
			}

			// Only validate single, non-composite, non-function values against a single data type
			const matcher = MATCHERS[syntax.toLowerCase()]
			if (matcher && !initial_value.includes('(') && !matcher(initial_value)) {
				report(messages.mismatched_initial_value(name, initial_value, `"${syntax}"`), initial_decl)
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
