
## SCF: campos e blocos

- **Local JSON está ativo** (`theme/inc/scf.php`): grupos de campos são lidos de e salvos em `theme/acf-json/`. Todo grupo criado ou alterado precisa gerar ou atualizar um JSON nessa pasta, que vai no commit. Campo que existe só no banco não chega para os outros devs. O conteúdo preenchido (valores) fica no banco e não vai no git.
- Se um JSON do repo for mais novo que o banco, o admin mostra "Sync disponível": sincronize para o grupo ficar editável na tela.
- **Bloco novo:** crie `theme/blocks/<nome>/block.json` (`"name": "{{slug}}/<nome>"`, `"category": "{{slug}}"`, `"acf": { "mode": "preview", "renderTemplate": "render.php" }`) e `render.php`. Crie o grupo de campos em `theme/acf-json/group_<nome>.json` com `location` `block == {{slug}}/<nome>`. Os blocos são registrados sozinhos pelo `glob` em `inc/scf.php`.
- Guarde chamadas ao SCF com `function_exists('get_field')`, porque o tema não pode quebrar sem o plugin.
