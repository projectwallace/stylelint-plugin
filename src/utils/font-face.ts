import type { AtRule } from 'postcss'
import { str_equals } from '@projectwallace/css-parser/string-utils'

/** Is this node directly inside an `@font-face` rule? */
export function is_in_font_face(node: { parent?: unknown }): boolean {
	const parent = node.parent as AtRule | undefined
	return parent?.type === 'atrule' && str_equals('font-face', parent.name)
}
