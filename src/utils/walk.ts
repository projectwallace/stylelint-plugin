import type { AtRule, Container, Declaration } from 'postcss'
import { is_custom, str_equals } from '@projectwallace/css-parser/string-utils'

/**
 * Walk declarations whose property is one of `names`, compared case-insensitively.
 * `names` MUST be lowercase. Return `false` from the callback to stop walking.
 */
export function walk_decls(
	container: Container,
	names: readonly string[],
	callback: (declaration: Declaration) => void | false,
): void {
	container.walkDecls((declaration) => {
		for (const name of names) {
			if (str_equals(name, declaration.prop)) {
				return callback(declaration)
			}
		}
	})
}

/** Walk declarations of custom properties (`--*`). Return `false` from the callback to stop walking. */
export function walk_custom_decls(
	container: Container,
	callback: (declaration: Declaration) => void | false,
): void {
	container.walkDecls((declaration) => {
		if (is_custom(declaration.prop)) {
			return callback(declaration)
		}
	})
}

/**
 * Walk at-rules whose name is one of `names`, compared case-insensitively.
 * `names` MUST be lowercase. Return `false` from the callback to stop walking.
 */
export function walk_atrules(
	container: Container,
	names: readonly string[],
	callback: (at_rule: AtRule) => void | false,
): void {
	container.walkAtRules((at_rule) => {
		for (const name of names) {
			if (str_equals(name, at_rule.name)) {
				return callback(at_rule)
			}
		}
	})
}
