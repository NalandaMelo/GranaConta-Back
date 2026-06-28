import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/** Caminho absoluto para o arquivo do banco SQLite na raiz do projeto. */
const DB_PATH = path.join(__dirname, '..', '..', 'granaconta.db');

/** Instância singleton do banco de dados. */
let db: Database.Database;

/**
 * Executa migrações incrementais em bancos já existentes.
 *
 * Cada migração é protegida por try-catch para ignorar
 * operações que já foram aplicadas em execuções anteriores
 * (ex: adicionar coluna que já existe).
 *
 * @param database - Instância do banco para aplicar as migrações.
 */
function runMigrations(database: Database.Database): void {
  // Migração 1: adicionar coluna premium a usuários existentes
  try {
    database.exec('ALTER TABLE usuarios ADD COLUMN premium INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Coluna já existe — ignorar silenciosamente
  }
}

/**
 * Retorna a conexão com o banco SQLite (singleton).
 *
 * Na primeira chamada, cria/abre o banco, ativa WAL mode e foreign keys,
 * executa o schema DDL (criação de tabelas se não existirem)
 * e aplica migrações incrementais em bancos existentes.
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

    runMigrations(db);
  }
  return db;
}
