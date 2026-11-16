<?php

/*
 * Secure Custom Fields: grupos de campos versionados em acf-json/ (Local JSON)
 * e blocos do Gutenberg em blocks/<nome>/block.json.
 */

$acf_json = get_theme_file_path('acf-json');

add_filter('acf/settings/save_json', fn() => $acf_json);
add_filter('acf/settings/load_json', fn() => [$acf_json]);

add_action('init', function () {
    foreach (glob(get_theme_file_path('blocks/*/block.json')) as $block_json) {
        register_block_type(dirname($block_json));
    }
});

add_filter('block_categories_all', function (array $categories) {
    array_unshift($categories, ['slug' => '{{slug}}', 'title' => '{{nome}}']);

    return $categories;
});
