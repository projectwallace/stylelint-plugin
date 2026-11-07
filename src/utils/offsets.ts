import type { AtRule, Declaration } from 'postcss'

/** Offset of a declaration's value from the start of the declaration (`prop` + `between`). */
export function get_value_offset(declaration: Declaration): number {
	return declaration.prop.length + (declaration.raws.between ?? ': ').length
}

/** Offset of an at-rule's params from the start of the at-rule (`@` + `name` + `afterName`). */
export function get_params_offset(at_rule: AtRule): number {
	return 1 + at_rule.name.length + (at_rule.raws.afterName ?? ' ').length
}
