import max_selector_complexity from './rules/max-selector-complexity/index.js'
import no_unused_custom_properties from './rules/no-unused-custom-properties/index.js'
import no_property_browserhacks from './rules/no-property-browserhacks/index.js'
import max_lines_of_code from './rules/max-lines-of-code/index.js'

export default [
	max_selector_complexity,
	max_lines_of_code,
	no_unused_custom_properties,
	no_property_browserhacks
]