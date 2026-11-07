import stylelint from 'stylelint'

const { createPlugin } = stylelint

const RULE_PREFIX = 'projectwallace/'
const README_BASE = 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules'

/** URL of a rule's README, derived from its fully qualified name (`projectwallace/<name>`). */
export function get_rule_url(rule_name: string): string {
	const short_name = rule_name.startsWith(RULE_PREFIX)
		? rule_name.slice(RULE_PREFIX.length)
		: rule_name
	return `${README_BASE}/${short_name}/README.md`
}

interface DefineRuleOptions {
	/** Set when the primary option is an array (e.g. a tuple) */
	primaryOptionArray?: boolean
}

/**
 * Attach the standard metadata (`ruleName`, `messages`, `meta`) to a rule function and
 * register it as a stylelint plugin.
 */
export function define_rule<F extends (...args: any[]) => any>(
	rule_name: string,
	rule_function: F,
	messages: Record<string, unknown>,
	options: DefineRuleOptions = {},
): stylelint.Plugin {
	const rule = rule_function as unknown as stylelint.Rule
	rule.ruleName = rule_name
	rule.messages = messages as stylelint.RuleMessages
	rule.meta = { url: get_rule_url(rule_name) }
	if (options.primaryOptionArray) {
		rule.primaryOptionArray = true
	}
	return createPlugin(rule_name, rule)
}
