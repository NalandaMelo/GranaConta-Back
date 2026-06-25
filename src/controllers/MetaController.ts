import { Request, Response } from 'express';
import {
  createMeta,
  findMetaById,
  listMetasByUsuario,
  updateMeta,
  deleteMeta,
} from '../models/MetaFinanceira';
import { MetaResponse } from '../types';

/**
 * Formata valor numérico para o padrão brasileiro (vírgula decimal).
 * Ex: 6000.00 → "6000,00"
 */
function formatValor(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}

/**
 * Converte string de valor (formato brasileiro) para número.
 * Ex: "6000,00" → 6000.00
 */
function parseValor(valorStr: string): number {
  return parseFloat((valorStr as string).replace(',', '.'));
}

/** Converte uma meta do banco para o formato de resposta da API. */
function toMetaResponse(row: {
  id: number;
  nome: string;
  valor: number;
  guardado: number;
}): MetaResponse {
  return {
    id: row.id,
    nome: row.nome,
    valor: formatValor(row.valor),
    guardado: formatValor(row.guardado),
  };
}

/** Controlador de rotas de metas financeiras. */
export const MetaController = {
  /**
   * GET /metas
   * Lista todas as metas financeiras do usuário autenticado.
   */
  listar(req: Request, res: Response): void {
    try {
      const metas = listMetasByUsuario(req.usuarioId!);
      res.status(200).json({
        metas: metas.map(toMetaResponse),
      });
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * GET /metas/:id
   * Retorna uma meta específica com o cálculo de porcentagem concluída.
   */
  obter(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const meta = findMetaById(id, req.usuarioId!);
      if (!meta) {
        res.status(404).json({ erro: 'Meta não encontrada' });
        return;
      }

      const response = toMetaResponse(meta);
      const porcentagem =
        meta.valor > 0
          ? ((meta.guardado / meta.valor) * 100).toFixed(2).replace('.', ',')
          : '0,00';

      res.status(200).json({ ...response, porcentagem });
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * POST /metas
   * Cria uma nova meta financeira.
   */
  criar(req: Request, res: Response): void {
    try {
      const { nome, valor, guardado } = req.body;

      if (!nome || valor === undefined || guardado === undefined) {
        res.status(400).json({ erro: 'Campos obrigatórios: nome, valor, guardado' });
        return;
      }

      const valorNumerico = parseValor(valor);
      const guardadoNumerico = parseValor(guardado);

      createMeta(nome, valorNumerico, guardadoNumerico, req.usuarioId!);

      res.status(201).json({});
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * PUT /metas/:id
   * Atualiza uma meta: permite alterar nome/valor e também adicionar
   * ou subtrair valor do montante já guardado.
   */
  atualizar(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const meta = findMetaById(id, req.usuarioId!);
      if (!meta) {
        res.status(404).json({ erro: 'Meta não encontrada' });
        return;
      }

      const { nome, valor, adicionar, subtrair } = req.body;

      if (!nome || valor === undefined) {
        res.status(400).json({ erro: 'Campos obrigatórios: nome, valor' });
        return;
      }

      const valorNumerico = parseValor(valor);
      const adicionarNumerico = adicionar !== undefined ? parseValor(adicionar) : 0;
      const subtrairNumerico = subtrair !== undefined ? parseValor(subtrair) : 0;

      const novoGuardado = meta.guardado + adicionarNumerico - subtrairNumerico;

      updateMeta(id, req.usuarioId!, nome, valorNumerico, novoGuardado);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * DELETE /metas/:id
   * Remove uma meta financeira.
   */
  excluir(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }

      const deleted = deleteMeta(id, req.usuarioId!);
      if (!deleted) {
        res.status(404).json({ erro: 'Meta não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },
};
