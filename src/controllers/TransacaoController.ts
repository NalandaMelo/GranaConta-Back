import { Request, Response } from 'express';
import {
  createTransacao,
  findTransacaoById,
  listTransacoesByUsuario,
  updateTransacao,
  deleteTransacao,
} from '../models/Transacao';
import { findCategoriaByTipo, createCategoria } from '../models/Categoria';
import { TransacaoResponse } from '../types';

/**
 * Formata valor numérico para exibição no padrão brasileiro com sinal.
 * Ex: +300.50 → "+300,50" | -70.50 → "-70,50"
 */
function formatValor(valor: number): string {
  const abs = Math.abs(valor);
  const formatted = abs.toFixed(2).replace('.', ',');
  return valor >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Converte string de valor (formato brasileiro) para número.
 * Ex: "300,50" → 300.50
 */
function parseValor(valorStr: string): number {
  return parseFloat(valorStr.replace(',', '.'));
}

/** Converte uma transação bruta do banco para o formato de resposta da API. */
function toTransacaoResponse(row: {
  id: number;
  nome: string;
  valor: number;
  data: string;
  categoria_tipo: string;
}): TransacaoResponse {
  return {
    id: row.id,
    nome: row.nome,
    valor: formatValor(row.valor),
    categoria: row.categoria_tipo,
    data: row.data,
  };
}

/** Controlador de rotas de transações financeiras. */
export const TransacaoController = {
  /**
   * GET /transacoes
   * Lista todas as transações do usuário autenticado,
   * ordenadas por data decrescente.
   */
  listar(req: Request, res: Response): void {
    try {
      const transacoes = listTransacoesByUsuario(req.usuarioId!);
      res.status(200).json({
        transações: transacoes.map(toTransacaoResponse),
      });
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * POST /transacoes
   * Cria uma nova transação financeira.
   * Se a categoria informada não existir, ela é criada automaticamente.
   */
  criar(req: Request, res: Response): void {
    try {
      const { nome, valor, categoria, data } = req.body;

      if (!nome || valor === undefined || !categoria || !data) {
        res.status(400).json({ erro: 'Campos obrigatórios: nome, valor, categoria, data' });
        return;
      }

      let cat = findCategoriaByTipo(categoria);
      if (!cat) {
        cat = createCategoria(categoria);
      }

      const valorNumerico = parseValor(valor);
      createTransacao(nome, valorNumerico, data, cat.id, req.usuarioId!);

      res.status(201).json({});
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * PUT /transacoes/:id
   * Edita uma transação existente (nome, valor, categoria).
   * A data original é preservada (não é enviada no PUT).
   */
  editar(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const transacao = findTransacaoById(id, req.usuarioId!);
      if (!transacao) {
        res.status(404).json({ erro: 'Transação não encontrada' });
        return;
      }

      const { nome, valor, categoria } = req.body;

      if (!nome || valor === undefined || !categoria) {
        res.status(400).json({ erro: 'Campos obrigatórios: nome, valor, categoria' });
        return;
      }

      let cat = findCategoriaByTipo(categoria);
      if (!cat) {
        cat = createCategoria(categoria);
      }

      const valorNumerico = parseValor(valor);

      // Mantém a data original (PUT não envia data)
      updateTransacao(id, req.usuarioId!, nome, valorNumerico, cat.id);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * DELETE /transacoes/:id
   * Remove uma transação do banco.
   */
  excluir(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const deleted = deleteTransacao(id, req.usuarioId!);
      if (!deleted) {
        res.status(404).json({ erro: 'Transação não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },
};
