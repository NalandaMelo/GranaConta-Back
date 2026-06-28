import { Request, Response } from 'express';
import { updatePremiumStatus, findUsuarioById } from '../models/Usuario';

/**
 * Controlador da rota de admin para alterar o status premium de um usuário.
 *
 * A validação da senha é feita pelo middleware `adminAuthMiddleware`.
 * Este controlador apenas verifica se o usuário existe e altera o campo `premium`.
 */
export const AdminController = {
  /**
   * PATCH /admin/usuario/:id
   *
   * Body: { senhaAdmin: string, premium: number }
   * * premium: 0 = comum, 1 = premium
   *
   * Retorna 404 se o usuário não existir (senha já validada pelo middleware).
   */
  alterarPremium(req: Request, res: Response): void {
    try {
      const id = parseInt(`${req.params.id}`);
      if (isNaN(id)) {
        res.status(404).json({ erro: 'Não encontrado' });
        return;
      }

      const { premium } = req.body;
      if (premium === undefined || (premium !== 0 && premium !== 1)) {
        res.status(400).json({ erro: 'Campo obrigatório: premium (0 ou 1)' });
        return;
      }

      // Verifica se o usuário existe antes de atualizar
      const usuario = findUsuarioById(id);
      if (!usuario) {
        res.status(404).json({ erro: 'Não encontrado' });
        return;
      }

      updatePremiumStatus(id, premium);

      res.status(200).json({});
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },
};
