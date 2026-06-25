import { getDatabase } from '../config/database';
import { MetaFinanceiraRow } from '../types';

/**
 * Cria uma nova meta financeira.
 *
 * @param nome       - Nome/descrição da meta.
 * @param valor      - Valor total necessário para atingir a meta.
 * @param guardado   - Valor já economizado inicialmente.
 * @param usuario_id - ID do usuário dono da meta.
 * @returns A meta recém-criada.
 */
export function createMeta(
  nome: string,
  valor: number,
  guardado: number,
  usuario_id: number
): MetaFinanceiraRow {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO metas (nome, valor, guardado, usuario_id) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(nome, valor, guardado, usuario_id);
  return db.prepare('SELECT * FROM metas WHERE id = ?').get(result.lastInsertRowid) as MetaFinanceiraRow;
}

/**
 * Busca uma meta pelo ID, validando que pertence ao usuário informado.
 *
 * @returns A meta encontrada ou null.
 */
export function findMetaById(id: number, usuario_id: number): MetaFinanceiraRow | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM metas WHERE id = ? AND usuario_id = ?').get(id, usuario_id) as MetaFinanceiraRow | undefined;
  return row ?? null;
}

/**
 * Lista todas as metas de um usuário.
 *
 * @param usuario_id - ID do usuário.
 * @returns Array de metas financeiras.
 */
export function listMetasByUsuario(usuario_id: number): MetaFinanceiraRow[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM metas WHERE usuario_id = ?').all(usuario_id) as MetaFinanceiraRow[];
}

/**
 * Atualiza nome, valor total e valor guardado de uma meta.
 *
 * @returns true se a atualização afetou alguma linha.
 */
export function updateMeta(
  id: number,
  usuario_id: number,
  nome: string,
  valor: number,
  guardado: number
): boolean {
  const db = getDatabase();
  const result = db.prepare(
    'UPDATE metas SET nome = ?, valor = ?, guardado = ? WHERE id = ? AND usuario_id = ?'
  ).run(nome, valor, guardado, id, usuario_id);
  return result.changes > 0;
}

/**
 * Remove uma meta do banco.
 *
 * @returns true se foi removida, false se não encontrada.
 */
export function deleteMeta(id: number, usuario_id: number): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM metas WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  return result.changes > 0;
}
