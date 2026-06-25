import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/** Caminho absoluto para o arquivo do banco SQLite na raiz do projeto. */
const DB_PATH = path.join(__dirname, '..', '..', 'granaconta.db');

/** Instância singleton do banco de dados. */
let db: Database.Database;

/**
 * Retorna a conexão com o banco SQLite (singleton).
 * Na primeira chamada, cria/abre o banco, ativa WAL e foreign keys,
 * e executa o schema DDL (criação de tabelas se não existirem).
 *
 * @returns Instância do banco better-sqlite3.
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  }
  return db;
}
