import { TransacaoComCategoria, MetaFinanceiraRow } from '../types';

/**
 * Formata valor numérico para o padrão CSV (ponto como separador decimal, 2 casas).
 *
 * @param valor - Número a ser formatado.
 * @returns String no formato "1234.56".
 */
function formatValorCsv(valor: number): string {
  return valor.toFixed(2);
}

/** Dados de entrada para a geração do CSV. */
export interface RelatorioInput {
  transacoes: TransacaoComCategoria[];
  metas: MetaFinanceiraRow[];
}

/**
 * Gera o relatório financeiro completo em formato CSV (texto plano).
 *
 * O relatório é composto por 5 seções:
 * 1. Despesas (transações com valor negativo)
 * 2. Receitas (transações com valor positivo)
 * 3. Despesa por Categoria (agrupado)
 * 4. Receita por Categoria (agrupado)
 * 5. Lista de Metas (com valor guardado e faltante)
 *
 * @param data - Dados do relatório (transações + metas).
 * @returns String CSV completa com todas as seções.
 */
export function gerarCsv(data: RelatorioInput): string {
  const linhas: string[] = [];

  // ── Seção 1: Despesas (valor < 0) ──
  const despesas = data.transacoes.filter((t) => t.valor < 0);
  linhas.push('Tabela: Despesas');
  linhas.push('nome,categoria,valor');
  let totalDespesas = 0;
  for (const t of despesas) {
    const absValor = Math.abs(t.valor);
    totalDespesas += absValor;
    linhas.push(`${t.nome},${t.categoria_tipo},${formatValorCsv(absValor)}`);
  }
  linhas.push(`SOMA TOTAL DESPESAS,${formatValorCsv(totalDespesas)}`);
  linhas.push('');

  // ── Seção 2: Receitas (valor > 0) ──
  const receitas = data.transacoes.filter((t) => t.valor > 0);
  linhas.push('Tabela: Receitas');
  linhas.push('nome,categoria,valor');
  let totalReceitas = 0;
  for (const t of receitas) {
    totalReceitas += t.valor;
    linhas.push(`${t.nome},${t.categoria_tipo},${formatValorCsv(t.valor)}`);
  }
  linhas.push(`SOMA TOTAL RECEITAS,${formatValorCsv(totalReceitas)}`);
  linhas.push('');

  // ── Seção 3: Despesa por Categoria ──
  const despesaPorCat = new Map<string, number>();
  for (const t of despesas) {
    const atual = despesaPorCat.get(t.categoria_tipo) || 0;
    despesaPorCat.set(t.categoria_tipo, atual + Math.abs(t.valor));
  }
  linhas.push('Tabela: Despesa por Categoria');
  linhas.push('categoria,despesa_total');
  for (const [cat, total] of despesaPorCat.entries()) {
    linhas.push(`${cat},${formatValorCsv(total)}`);
  }
  linhas.push('');

  // ── Seção 4: Receita por Categoria ──
  const receitaPorCat = new Map<string, number>();
  for (const t of receitas) {
    const atual = receitaPorCat.get(t.categoria_tipo) || 0;
    receitaPorCat.set(t.categoria_tipo, atual + t.valor);
  }
  linhas.push('Tabela: Receita por Categoria');
  linhas.push('categoria,receita_total');
  for (const [cat, total] of receitaPorCat.entries()) {
    linhas.push(`${cat},${formatValorCsv(total)}`);
  }
  linhas.push('');

  // ── Seção 5: Lista de Metas ──
  linhas.push('Tabela: Lista de Metas');
  linhas.push('nome_meta,valor_guardado,valor_faltante');
  for (const m of data.metas) {
    const faltante = m.valor - m.guardado;
    linhas.push(`${m.nome},${formatValorCsv(m.guardado)},${formatValorCsv(faltante)}`);
  }

  return linhas.join('\n');
}
