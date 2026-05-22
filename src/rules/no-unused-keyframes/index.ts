import stylelint from "stylelint";
import type { Root, AtRule } from "postcss";
import { IDENTIFIER, OPERATOR, STRING } from "@projectwallace/css-parser/nodes";
import { parse_value } from "@projectwallace/css-parser/parse-value";
import { is_allowed } from "../../utils/option-validators.js";

const { createPlugin, utils } = stylelint;

const rule_name = "projectwallace/no-unused-keyframes";

const messages = utils.ruleMessages(rule_name, {
  rejected: (name: string) =>
    `Keyframes "${name}" was declared but never used in an animation-name or animation`,
});

const meta = {
  url: "https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-keyframes/README.md",
};

// Identifiers that appear in the `animation` shorthand but are never the animation name
const ANIMATION_NON_NAME_KEYWORDS = new Set([
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "step-start",
  "step-end",
  "infinite",
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
  "none",
  "forwards",
  "backwards",
  "both",
  "running",
  "paused",
  "auto",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);

interface SecondaryOptions {
  ignore?: Array<string | RegExp>;
}

const ruleFunction = (
  primaryOptions: true,
  secondaryOptions?: SecondaryOptions,
) => {
  return (root: Root, result: stylelint.PostcssResult) => {
    const validOptions = utils.validateOptions(result, rule_name, {
      actual: primaryOptions,
      possible: [true],
    });

    if (!validOptions) {
      return;
    }

    const declared_names = new Map<string, AtRule>();

    root.walkAtRules(/^keyframes$/i, (atRule) => {
      const name = atRule.params.trim();
      if (name && !declared_names.has(name)) {
        declared_names.set(name, atRule);
      }
    });

    if (declared_names.size === 0) return;

    const used_names = new Set<string>();

    root.walkDecls(/^animation-name$/i, (decl) => {
      const ast = parse_value(decl.value);
      for (const node of ast) {
        if (node.type === IDENTIFIER && node.text.toLowerCase() !== "none") {
          used_names.add(node.text);
        } else if (node.type === STRING) {
          // Suprisingly: keyframe names MAY be quoted
          used_names.add(node.text);
        }
      }
    });

    root.walkDecls(/^animation$/i, (decl) => {
      const ast = parse_value(decl.value);
      for (const node of ast) {
        if (node.type === OPERATOR) continue;
        if (node.type === IDENTIFIER) {
          if (!ANIMATION_NON_NAME_KEYWORDS.has(node.text.toLowerCase())) {
            used_names.add(node.text);
          }
        } else if (node.type === STRING) {
          // Suprisingly: keyframe names MAY be quoted
          used_names.add(node.text);
        }
      }
    });

    for (const [name, node] of declared_names) {
      if (used_names.has(name)) continue;

      if (secondaryOptions?.ignore && is_allowed(name, secondaryOptions.ignore))
        continue;

      utils.report({
        result,
        ruleName: rule_name,
        message: messages.rejected(name),
        node,
        word: name,
      });
    }
  };
};

ruleFunction.ruleName = rule_name;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(rule_name, ruleFunction);
