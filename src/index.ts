import type stylelint from 'stylelint'
import max_selector_complexity from './rules/max-selector-complexity/index.js'
import no_unused_custom_properties from './rules/no-unused-custom-properties/index.js'
import no_property_browserhacks from './rules/no-property-browserhacks/index.js'
import max_lines_of_code from './rules/max-lines-of-code/index.js'
import no_unused_layers from './rules/no-unused-layers/index.js'

const plugins: stylelint.Plugin[] = [
	max_selector_complexity,
	max_lines_of_code,
	no_unused_custom_properties,
	no_property_browserhacks,
	no_unused_layers,
]

export default plugins
