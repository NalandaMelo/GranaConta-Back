-- ============================================================
-- GranaConta — Schema do banco SQLite
-- ============================================================

-- Armazena os usuários do sistema.
-- Cada usuário possui um token UUID único usado para autenticação Bearer.
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    rendaMensal REAL NOT NULL,
    token TEXT
);

-- Catálogo de categorias de transações (ex: Alimentação, Salário).
-- Os registros são criados sob demanda ou pré-populados no schema.
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL UNIQUE
);

-- Registro de movimentações financeiras (receitas/despesas).
-- valor > 0  → receita
-- valor < 0  → despesa
CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL,
    categoria_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Metas financeiras de economia do usuário.
-- guardado: valor já acumulado; valor: objetivo total.
CREATE TABLE IF NOT EXISTS metas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,
    guardado REAL NOT NULL DEFAULT 0,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Categorias padrão inseridas na primeira execução (ignora se já existirem).
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Renda fixa');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Renda extra');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Salário');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Alimentação');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Assinatura');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Aluguel');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Despesa fixa');
