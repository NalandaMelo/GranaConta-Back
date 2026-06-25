import { getDatabase } from '../config/database';
import { CategoriaRow } from '../types';

/**
 * Busca uma categoria pelo nome (campo `tipo`).
 *
 * @param tipo - Nome da categoria (ex: "Alimentação").
 * @returns A categoria encontrada ou null.
 */
export function findCategoriaByTipo(tipo: string): CategoriaRow | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM categorias WHERE tipo = ?').get(tipo) as CategoriaRow | undefined;
  return row ?? null;
}

/**
 * Busca uma categoria pelo ID.
 *
 * @param id - ID da categoria.
 * @returns A categoria encontrada ou null.
 */
export function findCategoriaById(id: number): CategoriaRow | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM categorias WHERE id = ?').get(id) as CategoriaRow | undefined;
  return row ?? null;
}

/**
 * Cria uma nova categoria (ex: ao registrar transação com categoria inédita).
 *
 * @param tipo - Nome da nova categoria.
 * @returns A categoria recém-criada.
 */
export function createCategoria(tipo: string): CategoriaRow {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO categorias (tipo) VALUES (?)');
  const result = stmt.run(tipo);
  return db.prepare('SELECT * FROM categorias WHERE id = ?').get(result.lastInsertRowid) as CategoriaRow;
}

/**
 * Lista todas as categorias cadastradas.
 *
 * @returns Array de categorias.
 */
export function listCategorias(): CategoriaRow[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM categorias').all() as CategoriaRow[];
}
