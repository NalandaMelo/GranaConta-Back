/**
 * Representa uma linha da tabela `usuarios` no banco SQLite.
 */
export interface UsuarioRow {
  id: number;
  nome: string;
  email: string;
  senha: string;
  rendaMensal: number;
  token: string | null;
}

/**
 * Representa uma linha da tabela `categorias` no banco SQLite.
 * O campo `tipo` armazena o nome amigável da categoria (ex: "Alimentação").
 */
export interface CategoriaRow {
  id: number;
  tipo: string;
}

/**
 * Representa uma linha da tabela `transacoes` no banco SQLite.
 * `valor` é positivo para receitas e negativo para despesas.
 */
export interface TransacaoRow {
  id: number;
  nome: string;
  valor: number;
  data: string;
  categoria_id: number;
  usuario_id: number;
}

/**
 * Representa uma linha da tabela `metas` no banco SQLite.
 * `guardado` é o valor já economizado; `valor` é a meta total.
 */
export interface MetaFinanceiraRow {
  id: number;
  nome: string;
  valor: number;
  guardado: number;
  usuario_id: number;
}

/**
 * TransacaoRow com o nome da categoria (join com categorias).
 */
export interface TransacaoComCategoria extends TransacaoRow {
  categoria_tipo: string;
}

/**
 * Formato de resposta da API para uma transação.
 * `valor` é string formatada (ex: "+300,50" ou "-70,50").
 */
export interface TransacaoResponse {
  id: number;
  nome: string;
  valor: string;
  categoria: string;
  data: string;
}

/**
 * Formato de resposta da API para uma meta financeira.
 * Valores numéricos são convertidos para string com vírgula (ex: "6000,00").
 */
export interface MetaResponse {
  id: number,
  nome: string;
  valor: string;
  guardado: string;
}

/**
 * Extende o tipo Request do Express para incluir o ID do usuário autenticado,
 * injetado pelo middleware de autenticação.
 */
declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}
