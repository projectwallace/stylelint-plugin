/** @type {RegExp} Matches snake_case: lowercase letters, digits, and underscores */
const SNAKE_CASE_RE = /^[a-z_][a-z0-9_]*$/

/** @type {RegExp} Matches SCREAM_CASE: uppercase letters, digits, and underscores */
const SCREAM_CASE_RE = /^[A-Z][A-Z0-9_]*$/

/** @param {string} name */
function is_snake_case(name) {
	return SNAKE_CASE_RE.test(name)
}

/** @param {string} name */
function is_scream_case(name) {
	return SCREAM_CASE_RE.test(name)
}

const naming_convention_rule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Enforce snake_case or SCREAM_CASE for variables, and snake_case for function names',
		},
		schema: [],
	},
	/** @param {import('eslint').Rule.RuleContext} context */
	create(context) {
		return {
			/** @param {import('estree').VariableDeclarator} node */
			VariableDeclarator(node) {
				if (node.id.type !== 'Identifier') return
				const name = node.id.name
				if (!is_snake_case(name) && !is_scream_case(name)) {
					context.report({
						node: node.id,
						message: `Variable '${name}' should be in snake_case or SCREAM_CASE`,
					})
				}
			},
			/** @param {import('estree').FunctionDeclaration} node */
			FunctionDeclaration(node) {
				if (!node.id) return
				const name = node.id.name
				if (!is_snake_case(name)) {
					context.report({
						node: node.id,
						message: `Function '${name}' should be in snake_case`,
					})
				}
			},
		}
	},
}

const plugin = {
	meta: {
		name: 'naming-conventions',
	},
	rules: {
		'naming-conventions': naming_convention_rule,
	},
}

export default plugin
