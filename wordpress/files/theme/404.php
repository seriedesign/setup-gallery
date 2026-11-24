<?php get_header(); ?>
<h1 class="text-4xl font-bold text-brand">Página não encontrada</h1>
<p class="mt-6">O endereço não existe ou foi movido.</p>
<p class="mt-6"><a href="<?= esc_url(
    home_url('/'),
) ?>" class="underline">Voltar para o início</a></p>
<?php get_footer(); ?>
