import { Request, Response } from 'express';
import { getRelatorioData } from '../models/Relatorio';
import { gerarCsv } from '../services/CsvExporter';

/** Controlador da rota de relatório financeiro. */
export const RelatorioController = {
  /**
   * GET /relatorios
   * Gera e retorna um relatório financeiro completo em formato CSV (text/plain)
   * com despesas, receitas, agrupamentos por categoria e metas do usuário.
   */
  gerar(req: Request, res: Response): void {
    try {
      const data = getRelatorioData(req.usuarioId!);
      const csv = gerarCsv(data);

      res
        .status(200)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .send(csv);
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },
};
