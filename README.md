# setup-gallery

Arquivos base do processo de build de JS/CSS que a Série A usa em cada plataforma. Quem aplica
é a skill `seriea-dev-setup` (marketplace `seriedesign/claude-plugins`): ela identifica a
plataforma, faz as perguntas do `setup.json` e monta o build sobre o tema que já existe (ou cria
o mínimo, se o diretório estiver vazio).

Melhorou o build num projeto? Traga a melhoria para cá num PR. É assim que o próximo projeto já
nasce com ela.

## Plataformas

| Pasta | Build | Projeto de referência |
|---|---|---|
| [`wordpress/`](wordpress/) | esbuild (TS) + Tailwind 4 + Biome + Prettier-PHP, WordPress Playground | `wp-macaw-fruits` (commit `acd43db`) |
| [`tray/`](tray/) | esbuild (JS/TS) + sass + Biome, entradas por convenção, `*-critical` vira snippet | `tray-torres-cabral-2027` (`198087a` → `cac8288`) |

## Contrato de uma pasta de plataforma

```
<plataforma>/
  setup.json   # o que a skill precisa saber (abaixo)
  files/       # arquivos copiados para o projeto, com {{variaveis}}
```

`setup.json`:

| Campo | O que é |
|---|---|
| `nome` | Nome legível da plataforma |
| `fingerprint` | Lista de globs; se algum existir no projeto, é esta plataforma |
| `variaveis` | `{ "nome": "descrição/como inferir" }` — substituídas como `{{nome}}` em `files/` |
| `fontes` / `saida` | Onde ficam as fontes JS/CSS e para onde o build escreve |
| `perguntas` | Perguntas do grill-me específicas da plataforma (uma por vez, só as que não dá para inferir) |
| `arquivos` | Para cada arquivo de `files/`: `"substituir"` (o nosso vence; mostra o diff antes), `"mesclar"` (só os campos listados em `mesclar`) ou `"so-se-vazio"` (só cria em projeto vazio) ou `"so-se-ausente"` (cria se o arquivo não existir; se já existir, a skill só atualiza a seção de build/comandos, sem apagar o resto) |
| `mesclar` | Por arquivo, as chaves que a skill pode mexer (ex.: `scripts`, `devDependencies`) |
| `build_antigo` | Arquivos/scripts de builds que este substitui (mix, gulp, webpack…), para listar e remover com confirmação |
| `includes` | Onde a plataforma carrega o CSS/JS gerado; toda saída referenciada ali precisa existir depois do build |
| `verificar` | Comandos que precisam terminar com 0, em ordem |
| `notas` | Armadilhas conhecidas, em uma linha cada |

Nova plataforma = nova pasta seguindo o contrato. A skill não precisa mudar.
