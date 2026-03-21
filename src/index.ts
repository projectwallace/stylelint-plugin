import type stylelint from 'stylelint'
import max_selector_complexity from './rules/max-selector-complexity/index.js'
import no_unused_custom_properties from './rules/no-unused-custom-properties/index.js'
import no_unknown_custom_property from './rules/no-unknown-custom-property/index.js'
import no_property_browserhacks from './rules/no-property-browserhacks/index.js'
import max_lines_of_code from './rules/max-lines-of-code/index.js'
import no_unused_layers from './rules/no-unused-layers/index.js'
import no_unused_container_names from './rules/no-unused-container-names/index.js'
import no_undeclared_container_names from './rules/no-undeclared-container-names/index.js'
import no_anonymous_layers from './rules/no-anonymous-layers/index.js'
import no_useless_custom_property_assignment from './rules/no-useless-custom-property-assignment/index.js'
import no_unreachable_media_conditions from './rules/no-unreachable-media-conditions/index.js'
import no_static_media_query from './rules/no-static-media-query/index.js'

const plugins: stylelint.Plugin[] = [
	max_selector_complexity,
	max_lines_of_code,
	no_unused_custom_properties,
	no_unknown_custom_property,
	no_property_browserhacks,
	no_unused_layers,
	no_unused_container_names,
	no_undeclared_container_names,
	no_anonymous_layers,
	no_useless_custom_property_assignment,
	no_unreachable_media_conditions,
	no_static_media_query,
]

export default plugins
