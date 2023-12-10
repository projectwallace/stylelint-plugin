import stylelint from "stylelint";
import { parse, walk } from "css-tree";

const { createPlugin, utils } = stylelint;

const rule_name = "project-wallace/no-unused-custom-properties";

const messages = utils.ruleMessages(rule_name, {
	rejected: (property) =>
		`"${property}" was declared but never used in a var()`,
});

const meta = {
	url: "https://github.com/projectwallace/stylelint-plugins",
};

/** @type {import('stylelint').Rule<string>} */
const ruleFunction = (primaryOptions, secondaryOptions) => {
	return (root, result) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		});

		if (!validOptions) {
			return;
		}

		let declared_properties = new Set();
		/** @type {Set<string>} */
		let used_properties = new Set();

		root.walkDecls(function (declaration) {
			if (/^--/.test(declaration.prop)) {
				declared_properties.add(declaration);
			}

			let value = declaration.value;
			let parsed = parse(value, {
				context: "value",
				parseCustomProperty: true,
			});

			walk(parsed, function (node) {
				if (node.type === "Function" && node.name === "var") {
					let first_child = node.children.first;
					if (
						first_child !== null &&
						first_child.type === "Identifier" &&
						/^--/.test(first_child.name)
					) {
						used_properties.add(first_child.name);
					}
				}
			});
		});

		outer_declared: for (let declaration of declared_properties) {
			for (let used of used_properties) {
				if (used === declaration.prop) {
					continue outer_declared;
				}
			}

			if (secondaryOptions && secondaryOptions.ignoreProperties) {
				for (let ignored of secondaryOptions.ignoreProperties) {
					if (typeof ignored === "string" && ignored === declaration.prop) {
						continue outer_declared;
					} else if (
						ignored.constructor.name === "RegExp" &&
						ignored.test(declaration.prop)
					) {
						continue outer_declared;
					}
				}
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(declaration.prop),
				node: declaration,
				word: declaration.prop,
			});
		}
	};
};

ruleFunction.ruleName = rule_name;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(rule_name, ruleFunction);
