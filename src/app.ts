import express from 'express';
import cors from 'cors';
import usuarioRoutes from './routes/usuarioRoutes';
import transacaoRoutes from './routes/transacaoRoutes';
import metaRoutes from './routes/metaRoutes';
import relatorioRoutes from './routes/relatorioRoutes';

/** Instância do aplicativo Express. */
const app = express();

// ── Middleware globais ──
app.use(cors());            // Habilita CORS para todas as origens
app.use(express.json());    // Parse automático de JSON no body

// ── Rotas ──
app.use('/', usuarioRoutes);          // /usuarios, /usuario
app.use('/transacoes', transacaoRoutes); // /transacoes
app.use('/metas', metaRoutes);          // /metas
app.use('/relatorios', relatorioRoutes); // /relatorios

export default app;
