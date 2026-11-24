// Sobe o WordPress local (Playground) com o login que está no .env.
// Uso: npm run dev:wp   (o `dev` chama este)
//
// O banco versionado (db/) fica sem login: senha inutilizada e usuário genérico (ver
// scripts/credenciais-db.mjs). Aqui, ao subir, o usuário e a senha do .env são gravados no
// banco por um passo extra do blueprint; ao parar, o banco volta ao estado neutro. Assim o
// git nunca vê a senha de ninguém, e cada dev entra com a sua.
//
// O blueprint com a senha é temporário (pasta do sistema) e apagado ao sair.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { neutralizar } from './credenciais-db.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');

const usuario = process.env.WP_ADMIN_USER?.trim();
const senha = process.env.WP_ADMIN_PASSWORD;
const PLACEHOLDER = 'troque-esta-senha';

if (!usuario || !senha || senha === PLACEHOLDER) {
  console.error(
    'dev:wp: defina WP_ADMIN_USER e WP_ADMIN_PASSWORD no .env (copie o .env.example para .env\n' +
      'e troque a senha). O banco do repositório não guarda login: ele vem do seu .env.',
  );
  process.exit(1);
}
if (!/^[A-Za-z0-9_.@-]{3,60}$/.test(usuario)) {
  console.error('dev:wp: WP_ADMIN_USER aceita só letras, números e _ . @ - (3 a 60 caracteres).');
  process.exit(1);
}

// base64 evita qualquer escape de `$`, aspas ou barra invertida da senha dentro do PHP.
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const php = `<?php
require_once '/wordpress/wp-load.php';
global $wpdb;
$usuario = base64_decode('${b64(usuario)}');
$wpdb->update($wpdb->users, ['user_login' => $usuario, 'user_nicename' => sanitize_title($usuario)], ['ID' => 1]);
clean_user_cache(1);
wp_set_password(base64_decode('${b64(senha)}'), 1);
`;

// O `login: true` do blueprint vira um passo que roda PRIMEIRO e faz POST em wp-login.php com
// admin/password: com o banco sem senha ele falharia, e antes de gravar a do .env não há com
// o que entrar. Por isso sai o atalho e entra um passo de login explícito, depois do runPHP.
const blueprint = JSON.parse(readFileSync('blueprint.json', 'utf8'));
delete blueprint.login;
blueprint.steps = [
  ...(blueprint.steps ?? []),
  { step: 'runPHP', code: php },
  { step: 'login', username: usuario, password: senha },
];

const pastaTmp = mkdtempSync(join(tmpdir(), '{{slug}}-'));
const arquivoBlueprint = join(pastaTmp, 'blueprint.json');
writeFileSync(arquivoBlueprint, JSON.stringify(blueprint), { mode: 0o600 });

const bin = resolve('node_modules/@wp-playground/cli/wp-playground.js');
const filho = spawn(
  process.execPath,
  [
    bin,
    'server',
    ...process.argv.slice(2),
    '--login',
    '--blueprint',
    arquivoBlueprint,
    '--mount-dir-before-install',
    './db',
    '/wordpress/wp-content/database',
    '--mount-dir',
    './uploads',
    '/wordpress/wp-content/uploads',
    '--mount-dir',
    './theme',
    '/wordpress/wp-content/themes/{{slug}}',
  ],
  { stdio: 'inherit' },
);

// Ctrl+C chega aos dois processos; este fica de pé até o servidor sair para poder limpar.
process.on('SIGINT', () => {});
process.on('SIGTERM', () => filho.kill());

filho.on('exit', (codigo) => {
  rmSync(pastaTmp, { recursive: true, force: true });
  try {
    for (const d of readdirSync('db', { withFileTypes: true })) {
      const arquivo = join('db', d.name, '.ht.sqlite');
      if (d.isDirectory() && d.name.startsWith('.ht.') && existsSync(arquivo)) neutralizar(arquivo);
    }
  } catch (erro) {
    console.error(
      `dev:wp: não deu para limpar o login do banco (${erro.message}). Rode npm run db:fix.`,
    );
  }
  process.exit(codigo ?? 0);
});
