import { Request, Response, NextFunction } from 'express';

/** Senha fixa para acesso à rota de admin (apenas para teste). */
const ADMIN_PASSWORD = '1234';

/**
 * Middleware de autenticação para rotas de admin.
 *
 * Valida que o corpo da requisição contém o campo `senhaAdmin`
 * com o valor correto. Caso contrário, retorna 404 (por segurança,
 * não se revela se a senha ou o usuário está incorreto).
 *
 * @param req  - Request do Express.
 * @param res  - Response do Express.
 * @param next - Próximo middleware/rota.
 */
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { senhaAdmin } = req.body;

  if (senhaAdmin !== ADMIN_PASSWORD) {
    res.status(404).json({ erro: 'Não encontrado' });
    return;
  }

  next();
}
