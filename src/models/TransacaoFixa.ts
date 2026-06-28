import { getDatabase } from '../config/database';
import { TransacaoFixaRow } from '../types';

/**
 * Cria uma nova transação fixa recorrente.
 *
 * @param nome         - Descrição da transação fixa.
 * @param valor        - Magnitude do valor (sempre positivo).
 * @param data         - Dia do mês no formato "DD" (ex: "05").
 * @param categoria_id - ID da categoria ("Renda fixa" ou "Despesa fixa").
 * @param usuario_id   - ID do usuário dono da transação.
 * @returns A transação fixa recém-criada.
 */
export function createTransacaoFixa(
  nome: string,
  valor: number,
  data: string,
  categoria_id: number,
  usuario_id: number
): TransacaoFixaRow {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO transacoes_fixas (nome, valor, data, categoria_id, usuario_id) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(nome, valor, data, categoria_id, usuario_id);
  return db.prepare('SELECT * FROM transacoes_fixas WHERE id = ?').get(result.lastInsertRowid) as TransacaoFixaRow;
}

/**
 * Busca uma transação fixa pelo ID, validando que pertence ao usuário informado.
 *
 * @param id         - ID da transação fixa.
 * @param usuario_id - ID do usuário (segurança).
 * @returns A transação fixa encontrada ou null.
 */
export function findTransacaoFixaById(id: number, usuario_id: number): TransacaoFixaRow | null {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT * FROM transacoes_fixas WHERE id = ? AND usuario_id = ?'
  ).get(id, usuario_id) as TransacaoFixaRow | undefined;
  return row ?? null;
}

/**
 * Lista todas as transações fixas de um usuário, com o nome da categoria incluído via JOIN.
 *
 * @param usuario_id - ID do usuário.
 * @returns Array de transações fixas com categoria.
 */
export function listTransacoesFixasByUsuario(
  usuario_id: number
): (TransacaoFixaRow & { categoria_tipo: string })[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT tf.*, c.tipo AS categoria_tipo
    FROM transacoes_fixas tf
    JOIN categorias c ON tf.categoria_id = c.id
    WHERE tf.usuario_id = ?
    ORDER BY tf.data ASC
  `).all(usuario_id) as (TransacaoFixaRow & { categoria_tipo: string })[];
}

/**
 * Atualiza os dados de uma transação fixa (nome, valor, data, categoria).
 *
 * @param id         - ID da transação fixa.
 * @param usuario_id - ID do usuário (segurança).
 * @param nome       - Novo nome da transação fixa.
 * @param valor      - Nova magnitude do valor (sempre positivo).
 * @param data       - Novo dia do mês no formato "DD".
 * @param categoria_id - Novo ID da categoria.
 * @returns true se alguma linha foi alterada, false caso contrário.
 */
export function updateTransacaoFixa(
  id: number,
  usuario_id: number,
  nome: string,
  valor: number,
  data: string,
  categoria_id: number
): boolean {
  const db = getDatabase();
  const result = db.prepare(
    'UPDATE transacoes_fixas SET nome = ?, valor = ?, data = ?, categoria_id = ? WHERE id = ? AND usuario_id = ?'
  ).run(nome, valor, data, categoria_id, id, usuario_id);
  return result.changes > 0;
}

/**
 * Remove uma transação fixa do banco.
 *
 * @param id         - ID da transação fixa.
 * @param usuario_id - ID do usuário (segurança).
 * @returns true se foi removida, false se não encontrada.
 */
export function deleteTransacaoFixa(id: number, usuario_id: number): boolean {
  const db = getDatabase();
  const result = db.prepare(
    'DELETE FROM transacoes_fixas WHERE id = ? AND usuario_id = ?'
  ).run(id, usuario_id);
  return result.changes > 0;
}
