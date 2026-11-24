// Confere se o banco SQLite do Playground (db/) pode ser commitado.
// Uso: npm run db:check   (só confere; sai com erro se não puder)
//      npm run db:fix     (converte o banco para o modo normal, com o servidor parado)
//
// Por quê: o Playground não abre um SQLite em modo WAL (o boot cai com "Cannot escape data
// without an active database connection"), e um commit com o servidor rodando pode pegar o
// arquivo no meio de uma escrita. O banco só entra no git parado e em modo normal.
//
// "Servidor ligado" é descoberto pelo PROCESSO que serve ESTE diretório, não por uma porta
// fixa: cada worktree sobe o seu Playground numa porta diferente (ver README), então sondar
// a 9400 acusava o servidor de outra worktree (e recusava um commit que não era para
// recusar) e deixava passar o próprio, rodando em 9420 — justo o que a conferência existe
// para impedir. Olhar o arquivo aberto (lsof no .ht.sqlite) também não serve: o Playground
// só segura o fd durante a requisição, e parado entre duas ele some.

import { spawnSync } from 'node:child_process';
import {
  closeSync,
  existsSync,
  openSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  readSync,
  statSync,
} from 'node:fs';
import net from 'node:net';
import { basename, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { credenciaisNeutras, neutralizar } from './credenciais-db.mjs';

const fix = process.argv.includes('--fix');
const raiz = resolve('.');

const arquivos = readdirSync('db', { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith('.ht.'))
  .map((d) => join('db', d.name, '.ht.sqlite'))
  .filter(existsSync);

if (arquivos.length === 0) {
  console.log('db:check: nenhum banco em db/ (rode npm run dev:wp uma vez).');
  process.exit(0);
}

// Diretório de trabalho de um processo: /proc no Linux, lsof no macOS. null = não deu.
function cwdDoProcesso(pid) {
  try {
    return readlinkSync(`/proc/${pid}/cwd`);
  } catch {
    // não é Linux (ou /proc indisponível): tenta o lsof.
  }
  const r = spawnSync('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) return null;
  const linha = (r.stdout || '').split('\n').find((l) => l.startsWith('n'));
  return linha ? linha.slice(1) : null;
}

// Playgrounds servindo ESTA worktree. Devolve { pids, conferiu }: `conferiu: false` quer
// dizer que não deu para listar os processos (Windows sem ps, p.ex.), e aí cai no reforço
// da porta mais abaixo.
function playgroundsDesteDiretorio() {
  const r = spawnSync('ps', ['-axo', 'pid=,command='], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return { pids: [], conferiu: false };
  const pids = [];
  for (const linha of (r.stdout || '').split('\n')) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(linha);
    if (!m) continue;
    const [, pid, comando] = m;
    if (Number(pid) === process.pid) continue;
    // Só o processo do servidor em si: um shell (ou o `npm exec`) que tenha "playground" e
    // "--port" na linha de comando é quem CHAMOU o Playground, ou um comando qualquer que
    // só cita o script — e contar esses transforma o próprio db:check num falso positivo.
    if (!/^node(\.exe)?$/.test(basename(comando.split(/\s+/)[0] ?? ''))) continue;
    if (!/wp-playground|playground\.mjs/.test(comando)) continue;
    if (!/\bserver\b|--port/.test(comando)) continue;
    // Ou o comando cita esta worktree (node_modules/.bin/... desta pasta), ou o processo
    // roda a partir dela (mounts relativos: --mount-dir-before-install ./db).
    if (comando.includes(raiz) || cwdDoProcesso(pid) === raiz) pids.push(pid);
  }
  return { pids, conferiu: true };
}

// A porta sai do --port do script dev:wp (é de onde ela sai de verdade), com override por
// DB_CHECK_PORT. Só serve de reforço quando não deu para listar os processos.
function portaDoDevWp() {
  const env = process.env.DB_CHECK_PORT;
  if (env && /^\d+$/.test(env)) return Number(env);
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const m = /--port[= ](\d+)/.exec(pkg.scripts?.['dev:wp'] ?? '');
    if (m) return Number(m[1]);
  } catch {
    // package.json ilegível: sem reforço de porta, o resto da conferência continua.
  }
  return null;
}

function portaOcupada(porta) {
  return new Promise((aceita) => {
    const s = net.connect({ port: porta, host: '127.0.0.1' });
    s.once('connect', () => {
      s.destroy();
      aceita(true);
    });
    s.once('error', () => aceita(false));
  });
}

const { pids, conferiu } = playgroundsDesteDiretorio();
let servidorLigado = pids.length > 0;
const problemas = [];

if (servidorLigado) {
  problemas.push(
    `o dev:wp desta pasta está rodando (PID ${pids.join(', ')}): pare-o antes de commitar o ` +
      'banco, para não pegar o arquivo no meio de uma escrita.',
  );
} else if (!conferiu) {
  const porta = portaDoDevWp();
  if (porta !== null && (await portaOcupada(porta))) {
    servidorLigado = true;
    problemas.push(
      'não deu para listar os processos para saber se o seu dev:wp está de pé, e há algo ' +
        `escutando na porta ${porta}, a do script dev:wp. Se for o seu servidor, pare-o antes ` +
        'de commitar o banco; se for o Playground de outra worktree, aponte a sua porta em ' +
        'DB_CHECK_PORT.',
    );
  }
}

for (const arquivo of arquivos) {
  const fd = openSync(arquivo, 'r');
  const cab = Buffer.alloc(20);
  readSync(fd, cab, 0, 20, 0);
  closeSync(fd);
  const wal = cab[18] === 2 || cab[19] === 2;
  if (wal && fix && !servidorLigado) {
    const db = new DatabaseSync(arquivo);
    db.exec('PRAGMA journal_mode=delete');
    db.close();
    console.log(`db:fix: ${arquivo} convertido para o modo normal.`);
  } else if (wal) {
    problemas.push(
      `${arquivo} está em modo WAL (o Playground não abre). Pare o dev:wp e rode npm run db:fix.`,
    );
  }
  // O banco vai para o git e não pode guardar o login de ninguém (vem do .env; ver
  // scripts/credenciais-db.mjs). O dev:wp já limpa ao parar; isto pega parada à força.
  let neutro = true;
  try {
    neutro = credenciaisNeutras(arquivo);
  } catch {
    // banco sem a tabela de usuários (recém-criado): não há o que vazar.
  }
  if (!neutro) {
    if (fix && !servidorLigado) {
      neutralizar(arquivo);
      console.log(`db:fix: ${arquivo} sem login (senha inutilizada, sessões removidas).`);
    } else {
      problemas.push(
        `${arquivo} guarda login ou sessões de alguém. Pare o dev:wp e rode npm run db:fix ` +
          '(o login de cada dev vem do .env).',
      );
    }
  }
  for (const sufixo of ['-wal', '-shm', '-journal']) {
    if (existsSync(arquivo + sufixo) && statSync(arquivo + sufixo).size > 0) {
      problemas.push(
        `${arquivo + sufixo} existe: o servidor ainda não gravou tudo. Pare o dev:wp antes de commitar.`,
      );
    }
  }
}

if (problemas.length) {
  console.error(`db:check: NÃO commite o banco ainda.\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
console.log('db:check: banco ok para commit.');
