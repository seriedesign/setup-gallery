<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-white text-neutral-900'); ?>>
    <?php wp_body_open(); ?>
    <main class="mx-auto max-w-5xl p-6">
        <h1 class="text-4xl font-bold text-brand"><?php bloginfo(
            'name',
        ); ?></h1>
        <?php while (have_posts()) {
            the_post();
            the_title('<h2 class="mt-6 text-2xl">', '</h2>');
            the_content();
        } ?>
    </main>
    <?php wp_footer(); ?>
</body>
</html>
