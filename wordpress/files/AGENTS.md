# AGENTS.md

Instruções para agentes de IA (Claude Code e similares) neste repositório.

## Projeto

Tema **WordPress** de {{nome}}, mantido pela **Série A**. A fonte de CSS/JS fica em `src/` e o build sai em `theme/dist/`. Leia o [README](README.md) para os comandos.

- Nunca edite `theme/dist/*` à mão: é gerado por `npm run build`. Edite em `src/`.
- O JS sai como ESM: enfileire com `wp_enqueue_script_module`, não `wp_enqueue_script`.
- Não adicione webpack, Vite, Babel ou `@wordpress/scripts`. O build é `esbuild.mjs` + Tailwind CLI.
- Depois de mexer em `src/`, rode `npm run lint`, `npm run typecheck` e `npm run build` e confirme que terminam sem erro.
- Textos, commits e comunicação em **português**.
- Nunca adicione `Co-Authored-By` (nem qualquer outra marca de autoria de IA, como "Generated with ...") em commits ou pull requests.

## Skills da Série A

Antes de começar a tarefa, use a skill da Série A correspondente quando ela existir:

| Quando | Skill |
|---|---|
| Implementar ou ajustar tela a partir do Figma, "deixar 1:1", comparar fontes, espaçamentos e cores | `figma-1to1-comparison` (e `figma:figma-design-to-code` antes de ler o Figma) |
| Migrar header, footer, seção ou página de outro site para o tema | `seriea-wordpress:seriea-wordpress-migration` |
| Documentação de manutenção para o cliente | `seriea-wordpress:seriea-wordpress-docs` |
| Fazer commit ("commita", "sobe isso") | `seriea-git:seriea-git-commit`: conventional commits em português, sem `Co-Authored-By`, commits pequenos por assunto |
| Revisar uma alteração ou PR | `ponytail:ponytail-review` |

Se a skill não estiver instalada no ambiente, avise o usuário em vez de improvisar o processo dela.
