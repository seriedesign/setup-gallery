# {{nome}} — tema WordPress

Ambiente local com [WordPress Playground](https://wordpress.github.io/wordpress-playground/developers/local-development/wp-playground-cli/): WordPress + PHP 8.3 rodando em Node, com SQLite. Não precisa de Docker, PHP nem MySQL.

## Setup

```sh
npm ci
cp .env.example .env   # e troque a senha dentro do .env (Windows: copy .env.example .env)
npm run dev   # esbuild + Tailwind em watch + WordPress em http://127.0.0.1:9400 (já logado)
```

**O login do admin vem do `.env`** (`WP_ADMIN_USER` e `WP_ADMIN_PASSWORD`, cada dev com o seu; o `.env` não vai para o git). O `npm run dev:wp` recusa subir sem eles. Ao subir, ele grava o login no banco; ao parar, devolve o banco ao estado neutro (usuário `admin`, senha inutilizada, sem sessões), que é o que vai para o git. Entre no painel com o usuário e a senha do seu `.env`; o Playground já abre logado. O banco SQLite fica em `db/` e **vai para o git** (ver "Banco de dados" abaixo): todo dev parte do mesmo banco.

Se o servidor for encerrado à força (fechar o terminal, `kill`), o banco pode ficar com o seu login: o `npm run db:check` acusa e o `npm run db:fix` limpa, e o pre-commit barra o commit do banco nesse estado.

Se a porta 9400 estiver ocupada (outro Playground aberto), troque o `--port` do script `dev:wp`. No Git Bash do Windows, rode com `MSYS_NO_PATHCONV=1` para o `/wordpress` não virar um caminho do Windows.

## Scripts

- `npm run dev`: watch de TS/CSS
- `npm run dev:wp`: servidor WordPress com o tema montado
- `npm run db:check` / `npm run db:fix`: conferem (e corrigem) se o banco pode ser commitado; ver "Banco de dados"
- `npm run build`: build de produção em `theme/dist/`
- `npm run lint` / `npm run format`: Biome (TS/CSS/JSON) e Prettier (PHP)
- `npm run typecheck`

## Estrutura

```
src/css/main.css   entrada do Tailwind (tokens em @theme)
src/ts/main.ts     entrada do JS (sai como ESM)
theme/             o tema; theme/dist/ é gerado pelo build e não vai para o git
```

## Banco de dados

O banco local (`db/`, SQLite do Playground) e a mídia (`uploads/`) **são versionados**: `git pull` traz as páginas, menus e imagens que os outros montaram, e todo dev fica com o mesmo conteúdo. A produção é outro ambiente, com outro banco (os IDs diferem).

O banco é um arquivo binário: o git **não consegue mesclar** duas edições. Por isso:

1. **Antes de editar conteúdo:** `git pull`. Avise o time quando for mexer em páginas, para não haver dois devs no banco ao mesmo tempo.
2. **Para commitar o banco:** pare o `dev:wp`, rode `npm run db:check` e, se reprovar, `npm run db:fix`. Commite `db/` e `uploads/` **sozinhos**, em um commit só de conteúdo (`content: ...`), e dê push logo. Nunca no mesmo commit de código.
   O hook `.githooks/pre-commit` (instalado pelo `npm ci`, via `prepare`) faz essas conferências sozinho: se o commit tem `db/` ou `uploads/`, roda o `db:check` e barra quando o servidor está ligado, o banco está em WAL, guarda o login de alguém ou há arquivo de outro assunto junto. Se clonou sem `npm ci`, rode `node scripts/instalar-hooks.mjs`.
   "Servidor ligado" é o **seu** servidor, o Playground que roda a partir desta pasta: o `db:check` o procura entre os processos. Onde não der para listar os processos (Git Bash do Windows), ele sonda a porta do `--port` do script `dev:wp`; `DB_CHECK_PORT=9420` manda conferir outra.
3. **Conflito em `db/`:** não há como resolver à mão. Fique com o banco do remoto (`git checkout --theirs db uploads` durante o merge, ou `git checkout origin/main -- db uploads`) e refaça as suas edições.
4. **Banco em WAL:** o `dev:wp` cai no boot com `exit code 255` (em `--verbosity debug`: "Cannot escape data without an active database connection"). Pare o servidor e rode `npm run db:fix`.
5. **Teste e diagnóstico não rodam no `db/` do repositório:** copie `db/` para fora do repo e suba o Playground numa porta separada.
6. **Voltar ao banco do repositório** (descartar o que você editou): `git checkout -- db uploads`.

O banco do repositório **não guarda login**: a senha é inutilizada e as sessões são apagadas quando o `dev:wp` para. O `db:check` reprova um banco que ainda tenha o login de alguém. O diff do banco ainda pode mudar sem edição de conteúdo (opções transitórias do WordPress): só o commite quando houver conteúdo novo.

Convenções do projeto e instruções para agentes: [AGENTS.md](AGENTS.md).
