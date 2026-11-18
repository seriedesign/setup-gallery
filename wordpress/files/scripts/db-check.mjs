// Confere se o banco SQLite do Playground (db/) pode ser commitado.
// Uso: npm run db:check   (só confere; sai com erro se não puder)
//      npm run db:fix     (converte o banco para o modo normal, com o servidor parado)
//
// Por quê: o Playground não abre um SQLite em modo WAL (o boot cai com "Cannot escape data
// without an active database connection"), e um commit com o servidor rodando pode pegar o
// arquivo no meio de uma escrita. O banco só entra no git parado e em modo normal.
import { closeSync, existsSync, openSync, readdirSync, readSync, statSync } from 'node:fs';
import net from 'node:net';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const fix = process.argv.includes('--fix');

const arquivos = readdirSync('db', { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith('.ht.'))
  .map((d) => join('db', d.name, '.ht.sqlite'))
  .filter(existsSync);

if (arquivos.length === 0) {
  console.log('db:check: nenhum banco em db/ (rode npm run dev:wp uma vez).');
  process.exit(0);
}

const servidorLigado = await new Promise((resolve) => {
  const s = net.connect({ port: 9400, host: '127.0.0.1' });
  s.once('connect', () => {
    s.destroy();
    resolve(true);
  });
  s.once('error', () => resolve(false));
});

const problemas = [];
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
  for (const sufixo of ['-wal', '-shm', '-journal']) {
    if (existsSync(arquivo + sufixo) && statSync(arquivo + sufixo).size > 0) {
      problemas.push(
        `${arquivo + sufixo} existe: o servidor ainda não gravou tudo. Pare o dev:wp antes de commitar.`,
      );
    }
  }
}
if (servidorLigado) {
  problemas.push(
    'o dev:wp está rodando na porta 9400: pare-o antes de commitar o banco, para não pegar o arquivo no meio de uma escrita.',
  );
}

if (problemas.length) {
  console.error(`db:check: NÃO commite o banco ainda.\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
console.log('db:check: banco ok para commit.');
