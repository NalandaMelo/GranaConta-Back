import { Router } from 'express';
import { TransacaoController } from '../controllers/TransacaoController';
import { TransacaoFixaController } from '../controllers/TransacaoFixaController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ── Transações fixas recorrentes (rotas específicas primeiro) ──

/** @route GET /transacoes/fixas — Listar transações fixas */
router.get('/fixas', authMiddleware, TransacaoFixaController.listar);

/** @route POST /transacoes/fixas — Criar transação fixa */
router.post('/fixas', authMiddleware, TransacaoFixaController.criar);

/** @route PUT /transacoes/fixa/:id — Editar transação fixa */
router.put('/fixa/:id', authMiddleware, TransacaoFixaController.editar);

/** @route DELETE /transacoes/fixa/:id — Excluir transação fixa */
router.delete('/fixa/:id', authMiddleware, TransacaoFixaController.excluir);

/** @route POST /transacoes/fixa/:id — Confirmar transação fixa do mês */
router.post('/fixa/:id', authMiddleware, TransacaoFixaController.confirmar);

// ── Transações normais ──

/** @route GET /transacoes — Listar transações */
router.get('/', authMiddleware, TransacaoController.listar);

/** @route POST /transacoes — Criar transação */
router.post('/', authMiddleware, TransacaoController.criar);

/** @route PUT /transacoes/:id — Editar transação */
router.put('/:id', authMiddleware, TransacaoController.editar);

/** @route DELETE /transacoes/:id — Excluir transação */
router.delete('/:id', authMiddleware, TransacaoController.excluir);

export default router;
