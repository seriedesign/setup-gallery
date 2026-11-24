// Login do admin no banco versionado (db/): o que pode ir para o git e o que não.
//
// O banco é commitado e todo dev parte dele, então ele não pode guardar o login de ninguém.
// A credencial de verdade vem do .env (ver scripts/dev-wp.mjs), que grava no banco ao subir o
// servidor; ao parar (e no db:fix) este módulo devolve o banco ao estado neutro:
//   - senha `!`: não é um hash válido, então nenhuma senha confere;
//   - usuário `admin`: só um nome, o mesmo para todos;
//   - sem `session_tokens`: são os cookies de login (34 KB que também sujavam o diff).
// O `--login` do Playground entra por cookie e não precisa de senha, então o neutro não
// atrapalha o seed nem os prints.
import { DatabaseSync } from 'node:sqlite';

export const USUARIO_NEUTRO = 'admin';
export const SENHA_NEUTRA = '!';

export function credenciaisNeutras(arquivo) {
  const db = new DatabaseSync(arquivo, { readOnly: true });
  try {
    const u = db.prepare('SELECT user_login, user_pass FROM wp_users WHERE ID = 1').get();
    const sessoes = db
      .prepare("SELECT COUNT(*) n FROM wp_usermeta WHERE meta_key = 'session_tokens'")
      .get().n;
    return !!u && u.user_login === USUARIO_NEUTRO && u.user_pass === SENHA_NEUTRA && sessoes === 0;
  } finally {
    db.close();
  }
}

// Só com o servidor parado: o Playground não abre um SQLite que alguém está escrevendo.
export function neutralizar(arquivo) {
  const db = new DatabaseSync(arquivo);
  try {
    db.prepare(
      'UPDATE wp_users SET user_login = ?, user_nicename = ?, user_pass = ? WHERE ID = 1',
    ).run(USUARIO_NEUTRO, USUARIO_NEUTRO, SENHA_NEUTRA);
    db.prepare("DELETE FROM wp_usermeta WHERE meta_key = 'session_tokens'").run();
  } finally {
    db.close();
  }
}
