<?php get_header(); ?>
<h1 class="text-4xl font-bold text-brand"><?php bloginfo('name'); ?></h1>
<?php while (have_posts()) {
    the_post();
    the_title('<h2 class="mt-6 text-2xl">', '</h2>');
    the_content();
} ?>
<?php get_footer(); ?>
