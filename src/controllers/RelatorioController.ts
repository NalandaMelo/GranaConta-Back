import { Request, Response } from 'express';
import { getRelatorioData } from '../models/Relatorio';
import { findUsuarioById } from '../models/Usuario';
import { gerarCsv } from '../services/CsvExporter';

/** Controlador da rota de relatório financeiro. */
export const RelatorioController = {
  /**
   * GET /relatorios
   * Gera e retorna um relatório financeiro completo em formato CSV (text/plain)
   * com despesas, receitas, agrupamentos por categoria e metas do usuário.
   *
   * Restrito a usuários premium — se o usuário não for premium,
   * retorna 403 com corpo vazio.
   */
  gerar(req: Request, res: Response): void {
    try {
      const usuario = findUsuarioById(req.usuarioId!);
      if (!usuario) {
        res.status(404).json({ erro: 'Usuário não encontrado' });
        return;
      }

      if (!usuario.premium) {
        res.status(403).send();
        return;
      }

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
