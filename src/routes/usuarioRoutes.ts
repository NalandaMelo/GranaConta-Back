import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/** @route POST /usuarios — Criação de conta (pública) */
router.post('/usuarios', UsuarioController.cadastro);

/** @route POST /usuarios/login — Autenticação (pública) */
router.post('/usuarios/login', UsuarioController.login);

/** @route GET /usuarios — Listagem de usuários (protegida) */
router.get('/usuarios', authMiddleware, UsuarioController.listar);

/** @route GET /usuario — Informações do próprio usuário (protegida) */
router.get('/usuario', authMiddleware, UsuarioController.info);

export default router;
