import { getDatabase } from '../config/database';
import { TransacaoRow, TransacaoComCategoria } from '../types';

/**
 * Cria uma nova transação financeira.
 *
 * @param nome         - Descrição da transação.
 * @param valor        - Valor (positivo = receita, negativo = despesa).
 * @param data         - Data no formato "dd-MM-yyyy".
 * @param categoria_id - ID da categoria associada.
 * @param usuario_id   - ID do usuário dono da transação.
 * @returns A transação recém-criada.
 */
export function createTransacao(
  nome: string,
  valor: number,
  data: string,
  categoria_id: number,
  usuario_id: number
): TransacaoRow {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO transacoes (nome, valor, data, categoria_id, usuario_id) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(nome, valor, data, categoria_id, usuario_id);
  return db.prepare('SELECT * FROM transacoes WHERE id = ?').get(result.lastInsertRowid) as TransacaoRow;
}

/**
 * Busca uma transação pelo ID, validando que pertence ao usuário informado.
 *
 * @param id         - ID da transação.
 * @param usuario_id - ID do usuário (segurança).
 * @returns A transação encontrada ou null.
 */
export function findTransacaoById(id: number, usuario_id: number): TransacaoRow | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM transacoes WHERE id = ? AND usuario_id = ?').get(id, usuario_id) as TransacaoRow | undefined;
  return row ?? null;
}

/**
 * Lista todas as transações de um usuário, ordenadas por data decrescente,
 * com o nome da categoria incluído via JOIN.
 *
 * @param usuario_id - ID do usuário.
 * @returns Array de transações com categoria.
 */
export function listTransacoesByUsuario(usuario_id: number): TransacaoComCategoria[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT t.*, c.tipo AS categoria_tipo
    FROM transacoes t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.usuario_id = ?
    ORDER BY t.data DESC
  `).all(usuario_id) as TransacaoComCategoria[];
}

/**
 * Atualiza os dados de uma transação (nome, valor, categoria).
 * A data original é mantida.
 *
 * @returns true se alguma linha foi alterada, false caso contrário.
 */
export function updateTransacao(
  id: number,
  usuario_id: number,
  nome: string,
  valor: number,
  categoria_id: number
): boolean {
  const db = getDatabase();
  const result = db.prepare(
    'UPDATE transacoes SET nome = ?, valor = ?, categoria_id = ? WHERE id = ? AND usuario_id = ?'
  ).run(nome, valor, categoria_id, id, usuario_id);
  return result.changes > 0;
}

/**
 * Remove uma transação do banco.
 *
 * @returns true se foi removida, false se não encontrada.
 */
export function deleteTransacao(id: number, usuario_id: number): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM transacoes WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  return result.changes > 0;
}
