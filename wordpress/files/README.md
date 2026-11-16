# {{nome}} — tema WordPress

Ambiente local com [WordPress Playground](https://wordpress.github.io/wordpress-playground/developers/local-development/wp-playground-cli/): WordPress + PHP 8.3 rodando em Node, com SQLite. Não precisa de Docker, PHP nem MySQL.

## Setup

```sh
npm ci
npm run dev   # esbuild + Tailwind em watch + WordPress em http://127.0.0.1:9400 (já logado)
```

O usuário admin é `admin` / `password`. O banco SQLite é criado em `db/` na primeira execução e não vai para o git.

Se a porta 9400 estiver ocupada (outro Playground aberto), troque o `--port` do script `dev:wp`. No Git Bash do Windows, rode com `MSYS_NO_PATHCONV=1` para o `/wordpress` não virar um caminho do Windows.

## Scripts

- `npm run dev`: watch de TS/CSS
- `npm run dev:wp`: servidor WordPress com o tema montado
- `npm run build`: build de produção em `theme/dist/`
- `npm run lint` / `npm run format`: Biome (TS/CSS/JSON) e Prettier (PHP)
- `npm run typecheck`

## Estrutura

```
src/css/main.css   entrada do Tailwind (tokens em @theme)
src/ts/main.ts     entrada do JS (sai como ESM)
theme/             o tema; theme/dist/ é gerado pelo build e não vai para o git
```

Convenções do projeto e instruções para agentes: [AGENTS.md](AGENTS.md).
