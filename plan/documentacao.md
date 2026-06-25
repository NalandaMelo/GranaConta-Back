# Documentação do Projeto — GranaConta Backend

## 1. Visão Geral

O **GranaConta** é uma API REST de gerenciamento financeiro pessoal. Permite que usuários registrem receitas e despesas, definam metas financeiras e gerem relatórios mensais em formato CSV. Foi construída com **Node.js + Express + TypeScript** e utiliza **SQLite** (via `better-sqlite3`) como banco de dados embutido.

---

## 2. Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | — | Runtime |
| TypeScript | ~6.0 | Linguagem / tipo seguro |
| Express | ~5.2 | Framework HTTP |
| better-sqlite3 | ~12.10 | Banco de dados SQLite síncrono |
| uuid | ~10.0 | Geração de tokens UUID v4 |
| cors | ~2.8 | Middleware de CORS |
| tsx | ~4.19 | Execução/ watch em dev |
| json2csv | (instalada) | (disponível, mas não utilizada no código atual) |

---

## 3. Estrutura de Pastas

```
src/
├── app.ts                  # Configuração do Express (middlewares globais + montagem de rotas)
├── server.ts               # Ponto de entrada: sobe o servidor na porta
├── config/
│   ├── database.ts         # Singleton de conexão SQLite (WAL + foreign keys)
│   └── schema.sql          # DDL das tabelas + seed de categorias
├── types/
│   └── index.ts            # Interfaces TypeScript compartilhadas
├── middleware/
│   └── auth.ts             # Middleware de autenticação via token (Bearer)
├── services/
│   ├── TokenService.ts     # Geração e validação de tokens UUID
│   └── CsvExporter.ts      # Montagem do relatório CSV (5 seções)
├── models/
│   ├── Usuario.ts          # CRUD de usuários
│   ├── Transacao.ts        # CRUD de transações financeiras
│   ├── MetaFinanceira.ts   # CRUD de metas financeiras
│   ├── Categoria.ts        # Consulta/criação de categorias
│   └── Relatorio.ts        # Agrega dados para o relatório
├── controllers/
│   ├── UsuarioController.ts
│   ├── TransacaoController.ts
│   ├── MetaController.ts
│   └── RelatorioController.ts
└── routes/
    ├── usuarioRoutes.ts
    ├── transacaoRoutes.ts
    ├── metaRoutes.ts
    └── relatorioRoutes.ts
```

---

## 4. Banco de Dados (SQLite)

Arquivo: `granaconta.db` (criado automaticamente na raiz do projeto).

### 4.1 Tabelas

**usuarios**
| Coluna | Tipo | Restrições |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| nome | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| senha | TEXT | NOT NULL |
| rendaMensal | REAL | NOT NULL |
| token | TEXT | — |

**categorias**
| Coluna | Tipo | Restrições |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| tipo | TEXT | NOT NULL, UNIQUE |

**transacoes**
| Coluna | Tipo | Restrições |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| nome | TEXT | NOT NULL |
| valor | REAL | NOT NULL (positivo = receita, negativo = despesa) |
| data | TEXT | NOT NULL (formato DD-MM-YYYY) |
| categoria_id | INTEGER | NOT NULL, FK → categorias(id) |
| usuario_id | INTEGER | NOT NULL, FK → usuarios(id) |

**metas**
| Coluna | Tipo | Restrições |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| nome | TEXT | NOT NULL |
| valor | REAL | NOT NULL |
| guardado | REAL | DEFAULT 0 |
| usuario_id | INTEGER | NOT NULL, FK → usuarios(id) |

### 4.2 Categorias pré-cadastradas (seed)

`Renda fixa`, `Renda extra`, `Salário`, `Alimentação`, `Assinatura`, `Aluguel`, `Despesa fixa`

---

## 5. API — Rotas

Todas as rotas protegidas exigem o header `Authorization: Bearer <token>`.

| Método | Rota | Autenticação | Body | Resposta |
|---|---|---|---|---|
| POST | `/usuarios` | ❌ | `{ nome, email, senha, rendaMensal }` | 201 `{ "token": "..." }` |
| POST | `/usuarios/login` | ❌ | `{ email, senha }` | 200 `{ "token": "..." }` |
| GET | `/usuarios` | ✅ | — | 200 `{ "usuarios": [...] }` |
| GET | `/usuario` | ✅ | — | 200 `{ nome, email, rendaMensal }` |
| GET | `/transacoes` | ✅ | — | 200 `{ "transações": [...] }` |
| POST | `/transacoes` | ✅ | `{ nome, valor, categoria, data }` | 201 `{}` |
| PUT | `/transacoes/:id` | ✅ | `{ nome, valor, categoria }` | 204 |
| DELETE | `/transacoes/:id` | ✅ | — | 204 |
| GET | `/metas` | ✅ | — | 200 `{ "metas": [...] }` |
| GET | `/metas/:id` | ✅ | — | 200 `{ id, nome, valor, guardado, porcentagem }` |
| POST | `/metas` | ✅ | `{ nome, valor, guardado }` | 201 `{}` |
| PUT | `/metas/:id` | ✅ | `{ nome, valor, adicionar, subtrair }` | 204 |
| DELETE | `/metas/:id` | ✅ | — | 204 |
| GET | `/relatorios` | ✅ | — | 200 `text/plain` (CSV) |

> **Observação:** O campo `valor` nas requisições usa vírgula como separador decimal (ex: `"300,50"`). O campo `rendaMensal` no cadastro aceita tanto ponto quanto vírgula.

---

## 6. Camadas do Código

### 6.1 Entrada (`app.ts` e `server.ts`)

- **`app.ts`** — Cria a instância do Express, registra os middlewares globais (`cors`, `express.json()`) e monta os roteadores nos prefixos:
  - `/` para rotas de usuário (cadastro, login, info e listagem)
  - `/transacoes` para operações com transações
  - `/metas` para operações com metas
  - `/relatorios` para geração de relatório
- **`server.ts`** — Lê a porta da variável de ambiente `PORT` (default 3000) e inicia o servidor.

### 6.2 Config (`config/`)

- **`database.ts`** — Implementa um singleton `getDatabase()` que:
  1. Abre (ou cria) o arquivo `granaconta.db` com `better-sqlite3`.
  2. Ativa WAL mode e `foreign_keys = ON`.
  3. Executa o DDL do `schema.sql` com `CREATE TABLE IF NOT EXISTS`.
- **`schema.sql`** — Contém as instruções DDL para criar as quatro tabelas e inserir as categorias padrão (com `INSERT OR IGNORE`).

### 6.3 Tipos Compartilhados (`types/index.ts`)

Define interfaces TypeScript usadas em todo o projeto:
- `UsuarioRow`, `CategoriaRow`, `TransacaoRow`, `MetaFinanceiraRow` — linhas do banco
- `TransacaoComCategoria` — transação com nome da categoria (JOIN)
- `TransacaoResponse`, `MetaResponse` — formato de resposta da API (valores formatados como string)
- Extensão global do `Express.Request` para incluir `usuarioId?: number`

### 6.4 Middleware de Autenticação (`middleware/auth.ts`)

- **`authMiddleware`** — Extrai o token do header `Authorization: Bearer <token>`, consulta o banco via `findUsuarioByToken` e, se válido, anexa `req.usuarioId` com o ID do usuário. Responde 401 se o token estiver ausente ou inválido.

### 6.5 Services (`services/`)

- **`TokenService.ts`**:
  - `generateToken()` — Gera um UUID v4.
  - `findUsuarioByToken(token)` — Busca o ID do usuário pelo token no banco.
- **`CsvExporter.ts`**:
  - `gerarCsv(data)` — Recebe transações e metas e monta um CSV textual com 5 seções:
    1. **Despesas** (valor < 0, absoluto)
    2. **Receitas** (valor > 0)
    3. **Despesa por Categoria** (agrupado)
    4. **Receita por Categoria** (agrupado)
    5. **Lista de Metas** (com valor faltante)

### 6.6 Models (`models/`)

Cada model é um conjunto de funções puras que operam o banco de dados via `better-sqlite3`. Nenhuma instância de classe — apenas funções exportadas.

- **`Usuario.ts`**: `createUsuario`, `findUsuarioByEmail`, `findUsuarioById`, `updateToken`, `listUsuarios`
- **`Transacao.ts`**: `createTransacao`, `findTransacaoById`, `listTransacoesByUsuario` (JOIN com categorias), `updateTransacao`, `deleteTransacao`
- **`MetaFinanceira.ts`**: `createMeta`, `findMetaById`, `listMetasByUsuario`, `updateMeta`, `deleteMeta`
- **`Categoria.ts`**: `findCategoriaByTipo`, `findCategoriaById`, `createCategoria`, `listCategorias`
- **`Relatorio.ts`**: `getRelatorioData(usuario_id)` — retorna todas as transações (com categoria) e metas de um usuário

### 6.7 Controllers (`controllers/`)

Cada controller é um objeto com métodos que seguem a assinatura `(req: Request, res: Response): void`. Responsabilidades:
- Validar campos obrigatórios do body/params (400)
- Verificar existência de recursos (404/409)
- Chamar as funções dos models
- Formatar respostas (incluindo formatação de valores monetários com vírgula)
- Capturar erros inesperados (500)

**Destaques de formatação de valor:**
- `formatValor()` — Exibe valor com sinal (`+300,50` para receita, `-70,50` para despesa) usando vírgula como separador decimal.
- `parseValor()` — Converte string com vírgula para `number`.
- `formatRenda()` — Converte `number` para string com vírgula (sem sinal).

### 6.8 Routes (`routes/`)

Cada arquivo de rota cria um `Router` do Express e define os endpoints:
- **`usuarioRoutes.ts`**: `POST /usuarios`, `POST /usuarios/login` (públicos), `GET /usuarios`, `GET /usuario` (protegidos)
- **`transacaoRoutes.ts`**: CRUD completo sob `/transacoes` (todos protegidos)
- **`metaRoutes.ts`**: CRUD completo sob `/metas` (todos protegidos)
- **`relatorioRoutes.ts`**: `GET /` sob `/relatorios` (protegido)

---

## 7. Fluxo de Autenticação

1. **Cadastro** (`POST /usuarios`): Gera um UUID, salva o usuário com o token, retorna o token.
2. **Login** (`POST /usuarios/login`): Verifica email + senha, gera novo UUID, atualiza o token no banco, retorna o token.
3. **Requisições protegidas**: O middleware `authMiddleware` extrai o token do header `Authorization`, busca o usuário no banco e injeta `req.usuarioId`. Se o token não existir no banco, retorna 401.

> **Nota:** A senha não é hasheada — é armazenada e comparada em texto puro. Isso é uma limitação de segurança atual.

---

## 8. Relatório CSV

A rota `GET /relatorios` retorna um CSV textual (`Content-Type: text/plain`) com 5 seções separadas por linhas em branco:
1. **Tabela: Despesas** — lista de despesas com valor absoluto + soma total
2. **Tabela: Receitas** — lista de receitas + soma total
3. **Tabela: Despesa por Categoria** — agrupamento de despesas
4. **Tabela: Receita por Categoria** — agrupamento de receitas
5. **Tabela: Lista de Metas** — nome, valor guardado e valor faltante de cada meta

---

## 9. Como Executar

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

O servidor iniciará na porta definida em `PORT` (ambiente) ou 3000.

---

## 10. Considerações Finais

- O banco SQLite é criado automaticamente na primeira execução (arquivo `granaconta.db` na raiz do projeto).
- Categorias novas podem ser criadas dinamicamente via `POST /transacoes` ou `PUT /transacoes/:id` — se a categoria informada não existir, ela é criada automaticamente.
- Os valores monetários trafegam como string no formato brasileiro (vírgula como separador decimal) nas respostas e aceitam ponto ou vírgula nas requisições.
- O pacote `json2csv` está listado nas dependências mas não é utilizado no código atual — a geração do CSV é feita manualmente no `CsvExporter.ts`.
