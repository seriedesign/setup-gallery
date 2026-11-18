// Aponta o git para .githooks/ (pre-commit do banco). Roda no `npm ci`/`npm install` (prepare).
// Sem .git (build em CI, zip do tema) não faz nada e não falha.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (existsSync('.git')) {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks']);
}
