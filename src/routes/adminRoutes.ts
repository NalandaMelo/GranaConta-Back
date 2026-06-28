import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

/**
 * @route PATCH /admin/usuario/:id
 * Altera o status premium de um usuário.
 * Requer `senhaAdmin === "1234"` no corpo da requisição.
 * Retorna 404 se senha errada ou usuário não encontrado (não distingue, por segurança).
 */
router.patch('/admin/usuario/:id', adminAuthMiddleware, AdminController.alterarPremium);

export default router;
