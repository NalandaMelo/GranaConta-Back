CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    rendaMensal REAL NOT NULL,
    token TEXT,
    premium INTEGER NOT NULL DEFAULT 0  -- 0 = comum, 1 = premium
);

CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL UNIQUE
);

CREATE TABLE transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,          -- positivo = receita, negativo = despesa
    data TEXT NOT NULL,           -- formato DD-MM-YYYY
    categoria_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE metas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,
    guardado REAL NOT NULL DEFAULT 0,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE transacoes_fixas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,          -- sempre positivo (magnitude)
    data TEXT NOT NULL,           -- formato DD (dia do mês)
    categoria_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT OR IGNORE INTO categorias (tipo) VALUES ('Renda fixa');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Renda extra');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Salário');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Alimentação');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Assinatura');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Aluguel');
INSERT OR IGNORE INTO categorias (tipo) VALUES ('Despesa fixa');
