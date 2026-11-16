# AGENTS.md

Instruções para agentes de IA (Claude Code e similares) neste repositório.

## Projeto

Tema **Tray** de {{nome}}, mantido pela **Série A**. A fonte fica em `resources/` e o build sai em `theme/`. Leia o [README](README.md) para entender o build.

- Nunca edite `theme/js/*` nem `theme/css/*` à mão: são gerados por `npm run build`. Edite em `resources/`.
- Os snippets `theme/elements/snippets/*-critical.html` também são gerados (a partir de `resources/scss/*-critical.scss`).
- Novo CSS/JS por página: crie `resources/scss/<nome>.scss` ou `resources/js/<nome>.ts` na raiz da pasta. Parciais começam com `_`.
- Não adicione webpack, Vite, Babel ou laravel-mix. O build é `build.mjs` (esbuild + sass).
- jQuery é global da Tray: não instale nem importe.
- Depois de mexer em `resources/`, rode `npm run build` e confirme que termina sem erro.
- Textos, commits e comunicação em **português**.
- Nunca adicione `Co-Authored-By` (nem qualquer outra marca de autoria de IA, como "Generated with ...") em commits ou pull requests.

## Skills da Série A

Antes de começar a tarefa, use a skill da Série A correspondente quando ela existir:

| Quando | Skill |
|---|---|
| Implementar ou ajustar tela a partir do Figma, "deixar 1:1", comparar fontes, espaçamentos e cores | `figma-1to1-comparison` (e `figma:figma-design-to-code` antes de ler o Figma) |
| Fazer commit ("commita", "sobe isso") | `seriea-git:seriea-git-commit`: conventional commits em português, sem `Co-Authored-By`, commits pequenos por assunto |
| Auditoria de conversão, UX, performance ou acessibilidade da loja | `anthropic-skills:auditoria-cro-seriea` |
| Revisar uma alteração ou PR | `ponytail:ponytail-review` |

Se a skill não estiver instalada no ambiente, avise o usuário em vez de improvisar o processo dela.
