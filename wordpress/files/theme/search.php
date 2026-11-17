<?php
/** Resultado de /?s=termo. Sem ele, a busca cai no index.php: lista crua ou tela em branco. */
get_header(); ?>
<h1 class="text-4xl font-bold text-brand">
    <?= esc_html(
        get_search_query()
            ? sprintf('Resultados para “%s”', get_search_query())
            : 'Busca',
    ) ?>
</h1>
<?php if (have_posts()): ?>
    <ul class="mt-6 divide-y divide-neutral-200">
        <?php while (have_posts()): ?>
            <?php the_post(); ?>
            <li class="py-6">
                <a href="<?php the_permalink(); ?>" class="text-2xl underline"><?php the_title(); ?></a>
                <p class="mt-2"><?= esc_html(
                    wp_trim_words(get_the_excerpt(), 30),
                ) ?></p>
            </li>
        <?php endwhile; ?>
    </ul>
    <?php the_posts_pagination(['mid_size' => 1]); ?>
<?php else: ?>
    <p class="mt-6">Nenhum resultado encontrado. Tente outro termo.</p>
    <?php get_search_form(); ?>
<?php endif; ?>
<?php get_footer(); ?>
