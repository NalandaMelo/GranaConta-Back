import { Router } from 'express';
import { RelatorioController } from '../controllers/RelatorioController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/** @route GET /relatorios — Gerar relatório financeiro CSV */
router.get('/', authMiddleware, RelatorioController.gerar);

export default router;
