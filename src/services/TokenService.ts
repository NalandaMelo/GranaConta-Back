import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

/**
 * Gera um token UUID v4 único para autenticação de usuário.
 *
 * @returns String UUID (ex: "550e8400-e29b-41d4-a716-446655440000").
 */
export function generateToken(): string {
  return uuidv4();
}

/**
 * Localiza um usuário pelo token de autenticação.
 * Usado pelo middleware auth para validar o Bearer token.
 *
 * @param token - Token UUID a ser consultado.
 * @returns Objeto com o `id` do usuário ou null se não encontrado.
 */
export function findUsuarioByToken(token: string): { id: number } | null {
  const db = getDatabase();
  const row = db.prepare('SELECT id FROM usuarios WHERE token = ?').get(token) as { id: number } | undefined;
  return row ?? null;
}
