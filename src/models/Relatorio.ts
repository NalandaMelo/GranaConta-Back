import { getDatabase } from '../config/database';
import { TransacaoComCategoria, MetaFinanceiraRow } from '../types';

/** Dados brutos necessários para gerar o relatório financeiro de um usuário. */
export interface RelatorioData {
  transacoes: TransacaoComCategoria[];
  metas: MetaFinanceiraRow[];
}

/**
 * Busca todas as transações (com categoria) e metas de um usuário
 * para alimentar a geração do relatório CSV.
 *
 * @param usuario_id - ID do usuário.
 * @returns Objeto com listas de transações e metas.
 */
export function getRelatorioData(usuario_id: number): RelatorioData {
  const db = getDatabase();

  const transacoes = db.prepare(`
    SELECT t.*, c.tipo AS categoria_tipo
    FROM transacoes t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.usuario_id = ?
    ORDER BY t.data DESC
  `).all(usuario_id) as TransacaoComCategoria[];

  const metas = db.prepare(
    'SELECT * FROM metas WHERE usuario_id = ?'
  ).all(usuario_id) as MetaFinanceiraRow[];

  return { transacoes, metas };
}
