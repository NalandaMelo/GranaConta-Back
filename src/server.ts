import app from './app';

/** Porta do servidor (definida via env PORT ou 3000 por padrão). */
const PORT = process.env.PORT || 3000;

/** Ponto de entrada da aplicação — inicia o servidor HTTP. */
app.listen(PORT, () => {
  console.log(`GranaConta API rodando na porta ${PORT}`);
});
