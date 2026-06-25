import { Request, Response, NextFunction } from 'express';
import { findUsuarioByToken } from '../services/TokenService';

/**
 * Middleware de autenticação via Bearer token UUID.
 *
 * Extrai o token do header `Authorization: Bearer <token>`,
 * valida contra o banco de dados e injeta `req.usuarioId`.
 *
 * @param req  - Request do Express (recebe `usuarioId` se autenticado).
 * @param res  - Response do Express.
 * @param next - Próximo middleware/rota.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token não fornecido' });
    return;
  }

  const token = authHeader.slice(7);
  const usuario = findUsuarioByToken(token);

  if (!usuario) {
    res.status(401).json({ erro: 'Token inválido' });
    return;
  }

  req.usuarioId = usuario.id;
  next();
}
