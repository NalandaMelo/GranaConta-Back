import { Router } from 'express';
import { TransacaoController } from '../controllers/TransacaoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/** @route GET /transacoes — Listar transações */
router.get('/', authMiddleware, TransacaoController.listar);

/** @route POST /transacoes — Criar transação */
router.post('/', authMiddleware, TransacaoController.criar);

/** @route PUT /transacoes/:id — Editar transação */
router.put('/:id', authMiddleware, TransacaoController.editar);

/** @route DELETE /transacoes/:id — Excluir transação */
router.delete('/:id', authMiddleware, TransacaoController.excluir);

export default router;
