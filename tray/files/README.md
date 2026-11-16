# Tray — {{nome}}

Tema Tray de {{nome}}. O código-fonte fica em `resources/` e o build gera os arquivos finais em `theme/`.

## Requisitos

- Node 18.18+

## Comandos

```bash
npm install
npm run dev     # watch: a cada save roda o lint; com erro não gera nada, ao corrigir volta a buildar sozinho
npm run build   # produção: roda o lint antes e falha se houver erro; minificado, sem sourcemap
npm run lint      # Biome: lint + formatação de TS/JS, SCSS/CSS e JSON
npm run lint:fix  # corrige o que dá automaticamente
```

O lint usa o [Biome](https://biomejs.dev) com o preset `recommended` (config em [`biome.json`](biome.json)). Instale a extensão do Biome no editor para ver os erros enquanto digita e formatar ao salvar.

## Como o build funciona

O build está em [`build.mjs`](build.mjs): o **esbuild** cuida de JS/TS e da minificação do CSS, e o **sass** compila o SCSS. Não precisa de Babel, webpack nem configuração extra.

As entradas seguem uma convenção, então não existe lista de arquivos para manter:

| Fonte | Saída |
|---|---|
| `resources/js/<nome>.js` ou `.ts` | `theme/js/<nome>.js` (bundle IIFE) |
| `resources/scss/<nome>.scss` ou `.css` | `theme/css/<nome>.css` |
| `resources/scss/<nome>-critical.scss` | `theme/css/<nome>-critical.css` **e** `theme/elements/snippets/<nome>-critical.html` (`<style>` inline) |
| `resources/**/_<nome>.*` | parcial, não gera arquivo; é usado via `import` / `@use` |

Só os arquivos na **raiz** de `resources/js` e `resources/scss` viram entrada. Subpastas servem para organizar módulos e parciais.

### Criar um CSS/JS por página

Basta criar o arquivo, e ele já entra no build:

```
resources/scss/sd-home.scss     -> theme/css/sd-home.css
resources/js/sd-product.ts      -> theme/js/sd-product.js
```

Depois inclua o arquivo gerado no template da página correspondente.

### Bibliotecas (ex.: Swiper)

Instale pelo npm e importe normalmente:

```ts
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
```

```scss
@use 'swiper/swiper.css';
```

O jQuery **não** entra no bundle. Use o `$` / `jQuery` global que a Tray já carrega.

### Navegadores suportados

Target `es2020` / Safari 15, o mesmo piso do Swiper 11. O esbuild converte a sintaxe, mas não adiciona polyfills. Se precisar de uma API nova em um navegador antigo, importe o polyfill direto no arquivo que usa.

### Tailwind

Não vem instalado. Se o projeto precisar, rode o `@tailwindcss/cli` em paralelo, gerando um arquivo em `theme/css/`.
