import type stylelint from 'stylelint'
import max_average_declarations_per_rule from './rules/max-average-declarations-per-rule/index.js'
import max_average_selector_complexity from './rules/max-average-selector-complexity/index.js'
import max_average_selectors_per_rule from './rules/max-average-selectors-per-rule/index.js'
import max_average_specificity from './rules/max-average-specificity/index.js'
import max_comment_size from './rules/max-comment-size/index.js'
import max_declarations_per_rule from './rules/max-declarations-per-rule/index.js'
import max_embedded_content_size from './rules/max-embedded-content-size/index.js'
import max_file_size from './rules/max-file-size/index.js'
import max_important_ratio from './rules/max-important-ratio/index.js'
import max_lines_of_code from './rules/max-lines-of-code/index.js'
import max_selector_complexity from './rules/max-selector-complexity/index.js'
import max_selectors_per_rule from './rules/max-selectors-per-rule/index.js'
import max_spacing_resets from './rules/max-spacing-resets/index.js'
import max_unique_animation_functions from './rules/max-unique-animation-functions/index.js'
import max_unique_box_shadows from './rules/max-unique-box-shadows/index.js'
import max_unique_colors from './rules/max-unique-colors/index.js'
import max_unique_durations from './rules/max-unique-durations/index.js'
import max_unique_font_families from './rules/max-unique-font-families/index.js'
import max_unique_font_sizes from './rules/max-unique-font-sizes/index.js'
import max_unique_gradients from './rules/max-unique-gradients/index.js'
import max_unique_line_heights from './rules/max-unique-line-heights/index.js'
import max_unique_media_queries from './rules/max-unique-media-queries/index.js'
import max_unique_units from './rules/max-unique-units/index.js'
import min_declaration_uniqueness_ratio from './rules/min-declaration-uniqueness-ratio/index.js'
import min_selector_uniqueness_ratio from './rules/min-selector-uniqueness-ratio/index.js'
import no_anonymous_layers from './rules/no-anonymous-layers/index.js'
import no_duplicate_data_urls from './rules/no-duplicate-data-urls/index.js'
import no_invalid_z_index from './rules/no-invalid-z-index/index.js'
import no_property_browserhacks from './rules/no-property-browserhacks/index.js'
import no_property_shorthand from './rules/no-property-shorthand/index.js'
import no_static_container_query from './rules/no-static-container-query/index.js'
import no_static_media_query from './rules/no-static-media-query/index.js'
import no_unknown_container_names from './rules/no-unknown-container-names/index.js'
import no_unknown_custom_property from './rules/no-unknown-custom-property/index.js'
import no_unreachable_media_conditions from './rules/no-unreachable-media-conditions/index.js'
import no_unused_container_names from './rules/no-unused-container-names/index.js'
import no_unused_custom_properties from './rules/no-unused-custom-properties/index.js'
import no_unused_layers from './rules/no-unused-layers/index.js'
import no_useless_custom_property_assignment from './rules/no-useless-custom-property-assignment/index.js'

// Alphabetically ordered list of all plugins
const plugins: stylelint.Plugin[] = [
	max_average_declarations_per_rule,
	max_average_selector_complexity,
	max_average_selectors_per_rule,
	max_average_specificity,
	max_comment_size,
	max_declarations_per_rule,
	max_embedded_content_size,
	max_file_size,
	max_important_ratio,
	max_lines_of_code,
	max_selector_complexity,
	max_selectors_per_rule,
	max_spacing_resets,
	max_unique_animation_functions,
	max_unique_box_shadows,
	max_unique_colors,
	max_unique_durations,
	max_unique_font_families,
	max_unique_font_sizes,
	max_unique_gradients,
	max_unique_line_heights,
	max_unique_media_queries,
	max_unique_units,
	min_declaration_uniqueness_ratio,
	min_selector_uniqueness_ratio,
	no_anonymous_layers,
	no_duplicate_data_urls,
	no_invalid_z_index,
	no_property_browserhacks,
	no_property_shorthand,
	no_static_container_query,
	no_static_media_query,
	no_unknown_container_names,
	no_unknown_custom_property,
	no_unreachable_media_conditions,
	no_unused_container_names,
	no_unused_custom_properties,
	no_unused_layers,
	no_useless_custom_property_assignment,
]

export default plugins
