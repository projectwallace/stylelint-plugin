import type stylelint from 'stylelint'
import max_atrules from './rules/max-atrules/index.js'
import max_average_declarations_per_rule from './rules/max-average-declarations-per-rule/index.js'
import max_average_selector_complexity from './rules/max-average-selector-complexity/index.js'
import max_average_selectors_per_rule from './rules/max-average-selectors-per-rule/index.js'
import max_average_selector_specificity from './rules/max-average-selector-specificity/index.js'
import max_comment_size from './rules/max-comment-size/index.js'
import max_comments from './rules/max-comments/index.js'
import max_declarations from './rules/max-declarations/index.js'
import max_declarations_per_rule from './rules/max-declarations-per-rule/index.js'
import max_embedded_content_size from './rules/max-embedded-content-size/index.js'
import max_file_size from './rules/max-file-size/index.js'
import max_important_ratio from './rules/max-important-ratio/index.js'
import max_lines_of_code from './rules/max-lines-of-code/index.js'
import max_parameters from './rules/max-parameters/index.js'
import max_rules from './rules/max-rules/index.js'
import max_selector_complexity from './rules/max-selector-complexity/index.js'
import max_selectors from './rules/max-selectors/index.js'
import max_selectors_per_rule from './rules/max-selectors-per-rule/index.js'
import max_spacing_resets from './rules/max-spacing-resets/index.js'
import max_unique_animation_functions from './rules/max-unique-animation-functions/index.js'
import max_unique_border_radiuses from './rules/max-unique-border-radiuses/index.js'
import max_unique_box_shadows from './rules/max-unique-box-shadows/index.js'
import max_unique_custom_properties from './rules/max-unique-custom-properties/index.js'
import max_unique_layers from './rules/max-unique-layers/index.js'
import max_unique_text_shadows from './rules/max-unique-text-shadows/index.js'
import max_unique_color_formats from './rules/max-unique-color-formats/index.js'
import max_unique_colors from './rules/max-unique-colors/index.js'
import max_unique_durations from './rules/max-unique-durations/index.js'
import max_unique_font_families from './rules/max-unique-font-families/index.js'
import max_unique_font_sizes from './rules/max-unique-font-sizes/index.js'
import max_unique_gradients from './rules/max-unique-gradients/index.js'
import max_unique_keyframes from './rules/max-unique-keyframes/index.js'
import max_unique_line_heights from './rules/max-unique-line-heights/index.js'
import max_unique_media_queries from './rules/max-unique-media-queries/index.js'
import max_unique_supports_queries from './rules/max-unique-supports-queries/index.js'
import max_unique_units from './rules/max-unique-units/index.js'
import max_unique_z_indexes from './rules/max-unique-z-indexes/index.js'
import min_declaration_uniqueness_ratio from './rules/min-declaration-uniqueness-ratio/index.js'
import min_selector_uniqueness_ratio from './rules/min-selector-uniqueness-ratio/index.js'
import no_anonymous_layers from './rules/no-anonymous-layers/index.js'
import no_apply_too_many_arguments from './rules/no-apply-too-many-arguments/index.js'
import no_atrule_browserhacks from './rules/no-atrule-browserhacks/index.js'
import no_duplicate_anchor_names from './rules/no-duplicate-anchor-names/index.js'
import no_duplicate_container_names from './rules/no-duplicate-container-names/index.js'
import no_duplicate_custom_properties from './rules/no-duplicate-custom-properties/index.js'
import no_duplicate_data_urls from './rules/no-duplicate-data-urls/index.js'
import no_duplicate_font_faces from './rules/no-duplicate-font-faces/index.js'
import no_duplicate_functions from './rules/no-duplicate-functions/index.js'
import no_duplicate_keyframes from './rules/no-duplicate-keyframes/index.js'
import no_duplicate_mixins from './rules/no-duplicate-mixins/index.js'
import no_duplicate_parameters from './rules/no-duplicate-parameters/index.js'
import no_duplicate_registered_properties from './rules/no-duplicate-registered-properties/index.js'
import no_empty_mixins from './rules/no-empty-mixins/index.js'
import no_invalid_function_body from './rules/no-invalid-function-body/index.js'
import no_invalid_function_mixin_name from './rules/no-invalid-function-mixin-name/index.js'
import no_invalid_property_registration from './rules/no-invalid-property-registration/index.js'
import no_invalid_z_index from './rules/no-invalid-z-index/index.js'
import no_layer_in_mixin from './rules/no-layer-in-mixin/index.js'
import no_misplaced_mixin_rules from './rules/no-misplaced-mixin-rules/index.js'
import no_missing_if_else from './rules/no-missing-if-else/index.js'
import no_pseudo_elements_in_is_where from './rules/no-pseudo-elements-in-is-where/index.js'
import no_property_browserhacks from './rules/no-property-browserhacks/index.js'
import no_property_shorthand from './rules/no-property-shorthand/index.js'
import no_recursive_functions from './rules/no-recursive-functions/index.js'
import no_shadowed_parameters from './rules/no-shadowed-parameters/index.js'
import no_unused_font_faces from './rules/no-unused-font-faces/index.js'
import no_value_browserhacks from './rules/no-value-browserhacks/index.js'
import no_static_container_queries from './rules/no-static-container-queries/index.js'
import no_static_media_queries from './rules/no-static-media-queries/index.js'
import no_unknown_container_names from './rules/no-unknown-container-names/index.js'
import no_unknown_functions from './rules/no-unknown-functions/index.js'
import no_unknown_mixins from './rules/no-unknown-mixins/index.js'
import no_unreachable_if_branches from './rules/no-unreachable-if-branches/index.js'
import no_unreachable_media_conditions from './rules/no-unreachable-media-conditions/index.js'
import no_unused_container_names from './rules/no-unused-container-names/index.js'
import no_unused_custom_properties from './rules/no-unused-custom-properties/index.js'
import no_unused_functions from './rules/no-unused-functions/index.js'
import no_unused_keyframes from './rules/no-unused-keyframes/index.js'
import no_unused_layers from './rules/no-unused-layers/index.js'
import no_unused_mixins from './rules/no-unused-mixins/index.js'
import no_unused_parameters from './rules/no-unused-parameters/index.js'
import no_useless_custom_property_assignment from './rules/no-useless-custom-property-assignment/index.js'
import no_useless_if from './rules/no-useless-if/index.js'
import require_function_result from './rules/require-function-result/index.js'

// Alphabetically ordered list of all plugins
const plugins: stylelint.Plugin[] = [
	max_atrules,
	max_average_declarations_per_rule,
	max_average_selector_complexity,
	max_average_selectors_per_rule,
	max_average_selector_specificity,
	max_comment_size,
	max_comments,
	max_declarations,
	max_declarations_per_rule,
	max_embedded_content_size,
	max_file_size,
	max_important_ratio,
	max_lines_of_code,
	max_parameters,
	max_rules,
	max_selector_complexity,
	max_selectors,
	max_selectors_per_rule,
	max_spacing_resets,
	max_unique_animation_functions,
	max_unique_border_radiuses,
	max_unique_box_shadows,
	max_unique_custom_properties,
	max_unique_layers,
	max_unique_text_shadows,
	max_unique_color_formats,
	max_unique_colors,
	max_unique_durations,
	max_unique_font_families,
	max_unique_font_sizes,
	max_unique_gradients,
	max_unique_keyframes,
	max_unique_line_heights,
	max_unique_media_queries,
	max_unique_supports_queries,
	max_unique_units,
	max_unique_z_indexes,
	min_declaration_uniqueness_ratio,
	min_selector_uniqueness_ratio,
	no_anonymous_layers,
	no_apply_too_many_arguments,
	no_atrule_browserhacks,
	no_duplicate_anchor_names,
	no_duplicate_container_names,
	no_duplicate_custom_properties,
	no_duplicate_data_urls,
	no_duplicate_font_faces,
	no_duplicate_functions,
	no_duplicate_keyframes,
	no_duplicate_mixins,
	no_duplicate_parameters,
	no_duplicate_registered_properties,
	no_empty_mixins,
	no_invalid_function_body,
	no_invalid_function_mixin_name,
	no_invalid_property_registration,
	no_invalid_z_index,
	no_layer_in_mixin,
	no_misplaced_mixin_rules,
	no_missing_if_else,
	no_pseudo_elements_in_is_where,
	no_property_browserhacks,
	no_property_shorthand,
	no_recursive_functions,
	no_shadowed_parameters,
	no_unused_font_faces,
	no_value_browserhacks,
	no_static_container_queries,
	no_static_media_queries,
	no_unknown_container_names,
	no_unknown_functions,
	no_unknown_mixins,
	no_unreachable_if_branches,
	no_unreachable_media_conditions,
	no_unused_container_names,
	no_unused_custom_properties,
	no_unused_functions,
	no_unused_keyframes,
	no_unused_layers,
	no_unused_mixins,
	no_unused_parameters,
	no_useless_custom_property_assignment,
	no_useless_if,
	require_function_result,
]

export default plugins
