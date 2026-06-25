import { getDatabase } from '../config/database';
import { UsuarioRow } from '../types';

/**
 * Cria um novo usuário no banco.
 *
 * @param nome       - Nome do usuário.
 * @param email      - Email (único).
 * @param senha      - Senha em texto puro.
 * @param rendaMensal- Renda mensal informada.
 * @param token      - Token UUID de autenticação gerado no cadastro.
 * @returns A linha completa do usuário recém-criado.
 */
export function createUsuario(
  nome: string,
  email: string,
  senha: string,
  rendaMensal: number,
  token: string
): UsuarioRow {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO usuarios (nome, email, senha, rendaMensal, token) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(nome, email, senha, rendaMensal, token);
  return db.prepare('SELECT * FROM usuarios WHERE id = ?').get(result.lastInsertRowid) as UsuarioRow;
}

/**
 * Busca um usuário pelo email.
 *
 * @param email - Email a localizar.
 * @returns O usuário encontrado ou null.
 */
export function findUsuarioByEmail(email: string): UsuarioRow | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email) as UsuarioRow | undefined;
  return row ?? null;
}

/**
 * Busca um usuário pelo ID.
 *
 * @param id - ID do usuário.
 * @returns O usuário encontrado ou null.
 */
export function findUsuarioById(id: number): UsuarioRow | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id) as UsuarioRow | undefined;
  return row ?? null;
}

/**
 * Atualiza o token de autenticação de um usuário.
 * Usado no login para gerar um novo token.
 *
 * @param id    - ID do usuário.
 * @param token - Novo token UUID.
 */
export function updateToken(id: number, token: string): void {
  const db = getDatabase();
  db.prepare('UPDATE usuarios SET token = ? WHERE id = ?').run(token, id);
}

/**
 * Lista todos os usuários cadastrados (apenas id, nome e email).
 *
 * @returns Array com dados resumidos dos usuários.
 */
export function listUsuarios(): Pick<UsuarioRow, 'id' | 'nome' | 'email'>[] {
  const db = getDatabase();
  return db.prepare('SELECT id, nome, email FROM usuarios').all() as Pick<UsuarioRow, 'id' | 'nome' | 'email'>[];
}
