import type stylelint from 'stylelint'
import max_selector_complexity from './rules/max-selector-complexity/index.js'
import no_unused_custom_properties from './rules/no-unused-custom-properties/index.js'
import no_unknown_custom_property from './rules/no-unknown-custom-property/index.js'
import no_property_browserhacks from './rules/no-property-browserhacks/index.js'
import max_lines_of_code from './rules/max-lines-of-code/index.js'

const plugins: stylelint.Plugin[] = [
	max_selector_complexity,
	max_lines_of_code,
	no_unused_custom_properties,
	no_unknown_custom_property,
	no_property_browserhacks,
]

export default plugins
