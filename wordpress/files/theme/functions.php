<?php

add_action('after_setup_theme', function () {
    add_theme_support('title-tag'); // sem isso não existe <title>
    add_theme_support('post-thumbnails');
    add_theme_support('html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ]);
});

add_action('wp_enqueue_scripts', function () {
    $dir = get_theme_file_path('dist');
    $uri = get_theme_file_uri('dist');

    // filemtime como versão: cache-busting sem manifest
    wp_enqueue_style(
        '{{slug}}',
        "$uri/main.css",
        [],
        filemtime("$dir/main.css"),
    );
    wp_enqueue_script_module(
        '{{slug}}',
        "$uri/main.js",
        [],
        filemtime("$dir/main.js"),
    );
});
