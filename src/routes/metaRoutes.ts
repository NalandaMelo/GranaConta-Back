import { Router } from 'express';
import { MetaController } from '../controllers/MetaController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/** @route GET /metas — Listar metas */
router.get('/', authMiddleware, MetaController.listar);

/** @route GET /metas/:id — Obter meta específica com porcentagem */
router.get('/:id', authMiddleware, MetaController.obter);

/** @route POST /metas — Criar meta */
router.post('/', authMiddleware, MetaController.criar);

/** @route PUT /metas/:id — Atualizar meta */
router.put('/:id', authMiddleware, MetaController.atualizar);

/** @route DELETE /metas/:id — Excluir meta */
router.delete('/:id', authMiddleware, MetaController.excluir);

export default router;
