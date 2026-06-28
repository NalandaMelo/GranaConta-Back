import { Request, Response } from 'express';
import {
  createTransacaoFixa,
  findTransacaoFixaById,
  listTransacoesFixasByUsuario,
  updateTransacaoFixa,
  deleteTransacaoFixa,
} from '../models/TransacaoFixa';
import { createTransacao } from '../models/Transacao';
import { findCategoriaByTipo, findCategoriaById } from '../models/Categoria';
import { TransacaoFixaResponse } from '../types';

/** Formata valor para exibição no padrão brasileiro (vírgula, sem sinal). */
function formatValor(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}

/** Converte string de valor (formato brasileiro) para número. */
function parseValor(valorStr: string): number {
  return parseFloat(valorStr.replace(',', '.'));
}

/** Converte uma linha bruta do banco para o formato de resposta da API. */
function toTransacaoFixaResponse(row: {
  id: number;
  nome: string;
  valor: number;
  data: string;
  categoria_tipo: string;
}): TransacaoFixaResponse {
  return {
    id: row.id,
    nome: row.nome,
    valor: formatValor(row.valor),
    categoria: row.categoria_tipo,
    data: row.data,
  };
}

/** Categorias permitidas para transações fixas. */
const FIXED_CATEGORIES: Record<string, number> = {
  'Renda fixa': 1,
  'Despesa fixa': -1,
};

/**
 * Controlador de rotas de transações fixas recorrentes.
 * Lida com criação, listagem, edição, exclusão e confirmação mensal.
 */
export const TransacaoFixaController = {
  /**
   * GET /transacoes/fixas
   * Lista todas as transações fixas do usuário autenticado,
   * ordenadas por dia do mês crescente.
   */
  listar(req: Request, res: Response): void {
    try {
      const fixas = listTransacoesFixasByUsuario(req.usuarioId!);
      res.status(200).json({
        fixas: fixas.map(toTransacaoFixaResponse),
      });
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * POST /transacoes/fixas
   * Cria uma nova transação fixa recorrente.
   * A categoria deve ser "Renda fixa" ou "Despesa fixa".
   */
  criar(req: Request, res: Response): void {
    try {
      const { nome, valor, categoria, data } = req.body;

      if (!nome || valor === undefined || !categoria || !data) {
        res.status(400).json({ erro: 'Campos obrigatórios: nome, valor, categoria, data' });
        return;
      }

      // Valida se a categoria é uma das permitidas para transações fixas
      if (!(categoria in FIXED_CATEGORIES)) {
        res.status(400).json({ erro: 'Categoria deve ser "Renda fixa" ou "Despesa fixa"' });
        return;
      }

      const valorNumerico = parseValor(valor);
      if (valorNumerico <= 0) {
        res.status(400).json({ erro: 'Valor deve ser positivo' });
        return;
      }

      // Valida formato do dia ("01" a "31")
      if (!/^(0[1-9]|[12]\d|3[01])$/.test(data)) {
        res.status(400).json({ erro: 'Data deve ser um dia do mês no formato DD (01-31)' });
        return;
      }

      const cat = findCategoriaByTipo(categoria)!;
      createTransacaoFixa(nome, valorNumerico, data, cat.id, req.usuarioId!);

      res.status(201).json({});
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * PUT /transacoes/fixa/:id
   * Edita uma transação fixa existente (nome, valor, categoria, data).
   */
  editar(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const transacao = findTransacaoFixaById(id, req.usuarioId!);
      if (!transacao) {
        res.status(404).json({ erro: 'Transação fixa não encontrada' });
        return;
      }

      const { nome, valor, categoria, data } = req.body;

      if (!nome || valor === undefined || !categoria || !data) {
        res.status(400).json({ erro: 'Campos obrigatórios: nome, valor, categoria, data' });
        return;
      }

      if (!(categoria in FIXED_CATEGORIES)) {
        res.status(400).json({ erro: 'Categoria deve ser "Renda fixa" ou "Despesa fixa"' });
        return;
      }

      const valorNumerico = parseValor(valor);
      if (valorNumerico <= 0) {
        res.status(400).json({ erro: 'Valor deve ser positivo' });
        return;
      }

      if (!/^(0[1-9]|[12]\d|3[01])$/.test(data)) {
        res.status(400).json({ erro: 'Data deve ser um dia do mês no formato DD (01-31)' });
        return;
      }

      const cat = findCategoriaByTipo(categoria)!;
      updateTransacaoFixa(id, req.usuarioId!, nome, valorNumerico, data, cat.id);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * DELETE /transacoes/fixa/:id
   * Remove uma transação fixa do banco.
   */
  excluir(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const deleted = deleteTransacaoFixa(id, req.usuarioId!);
      if (!deleted) {
        res.status(404).json({ erro: 'Transação fixa não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * POST /transacoes/fixa/:id
   * Confirma (ou não) que a transação fixa ocorreu neste mês.
   *
   * Body: { confirmacao: boolean }
   * - true:  cria uma transação normal com a data do padrão (dia) + mês/ano atual.
   *          O sinal do valor é definido pela categoria:
   *            "Renda fixa"    → valor positivo
   *            "Despesa fixa"  → valor negativo
   * - false: apenas retorna 200 (ignora).
   */
  confirmar(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const transacao = findTransacaoFixaById(id, req.usuarioId!);
      if (!transacao) {
        res.status(404).json({ erro: 'Transação fixa não encontrada' });
        return;
      }

      const { confirmacao } = req.body;
      if (typeof confirmacao !== 'boolean') {
        res.status(400).json({ erro: 'Campo obrigatório: confirmacao (boolean)' });
        return;
      }

      if (!confirmacao) {
        res.status(200).json({});
        return;
      }

      // Determinar o sinal com base na categoria
      const cat = findCategoriaById(transacao.categoria_id);

      if (!cat) {
        res.status(500).json({ erro: 'Categoria não encontrada' });
        return;
      }

      const valorComSinal = cat.tipo === 'Despesa fixa'
        ? -Math.abs(transacao.valor)
        : Math.abs(transacao.valor);

      // Montar data completa: dia da fixa + mês atual + ano atual
      const agora = new Date();
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const ano = String(agora.getFullYear());
      const dataConfirmada = `${transacao.data}-${mes}-${ano}`;

      // Criar transação normal
      createTransacao(
        transacao.nome,
        valorComSinal,
        dataConfirmada,
        transacao.categoria_id,
        req.usuarioId!
      );

      res.status(201).json({});
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },
};
