// Aponta o git para .githooks/ (pre-commit do banco). Roda no `npm ci`/`npm install` (prepare).
// Sem .git (build em CI, zip do tema) não faz nada e não falha.
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PASTA = '.githooks';

if (existsSync('.git')) {
  execFileSync('git', ['config', 'core.hooksPath', PASTA]);

  // Hook sem bit de execução o git PULA em silêncio (só um hint, e o commit passa).
  for (const nome of readdirSync(PASTA)) {
    const caminho = join(PASTA, nome);
    if (!statSync(caminho).isFile()) continue;
    chmodSync(caminho, 0o755);
  }
}
