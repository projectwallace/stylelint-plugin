import { str_index_of } from '@projectwallace/css-parser/string-utils'

/** Cheap pre-filter: true if a declaration value may contain an `if()` function. */
export function has_if_function(value: string): boolean {
	return str_index_of('if(', value) !== -1
}
