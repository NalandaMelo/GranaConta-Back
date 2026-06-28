# Documentação do Projeto — GranaConta Backend

## 1. Visão Geral

O **GranaConta** é uma API REST de gerenciamento financeiro pessoal. Permite que usuários registrem receitas e despesas, definam metas financeiras, configurem transações fixas recorrentes e gerem relatórios mensais em formato CSV. Foi construída com **Node.js + Express + TypeScript** e utiliza **SQLite** (via `better-sqlite3`) como banco de dados embutido.

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
│   ├── database.ts         # Singleton de conexão SQLite (WAL + foreign keys + migrações)
│   └── schema.sql          # DDL das tabelas + seed de categorias
├── types/
│   └── index.ts            # Interfaces TypeScript compartilhadas
├── middleware/
│   ├── auth.ts             # Middleware de autenticação via token (Bearer)
│   └── adminAuth.ts        # Middleware de autenticação para rota de admin (senha "1234")
├── services/
│   ├── TokenService.ts     # Geração e validação de tokens UUID
│   └── CsvExporter.ts      # Montagem do relatório CSV (5 seções)
├── models/
│   ├── Usuario.ts          # CRUD de usuários (inclui updatePremiumStatus)
│   ├── Transacao.ts        # CRUD de transações financeiras
│   ├── TransacaoFixa.ts    # CRUD de transações fixas recorrentes
│   ├── MetaFinanceira.ts   # CRUD de metas financeiras
│   ├── Categoria.ts        # Consulta/criação de categorias
│   └── Relatorio.ts        # Agrega dados para o relatório
├── controllers/
│   ├── UsuarioController.ts
│   ├── TransacaoController.ts
│   ├── TransacaoFixaController.ts
│   ├── MetaController.ts
│   ├── RelatorioController.ts
│   └── AdminController.ts
└── routes/
    ├── usuarioRoutes.ts
    ├── transacaoRoutes.ts   # Rotas normais + fixas (fixa/:id antes de :id)
    ├── metaRoutes.ts
    ├── relatorioRoutes.ts
    └── adminRoutes.ts
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
| premium | INTEGER | NOT NULL, DEFAULT 0 (0 = comum, 1 = premium) |

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

**transacoes_fixas**
| Coluna | Tipo | Restrições |
|---|---|---|
| id | INTEGER | PK AUTOINCREMENT |
| nome | TEXT | NOT NULL |
| valor | REAL | NOT NULL (sempre positivo — magnitude) |
| data | TEXT | NOT NULL (formato DD — dia do mês) |
| categoria_id | INTEGER | NOT NULL, FK → categorias(id) |
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
| GET | `/transacoes/fixas` | ✅ | — | 200 `{ "fixas": [...] }` |
| POST | `/transacoes/fixas` | ✅ | `{ nome, valor, categoria, data }` | 201 `{}` |
| PUT | `/transacoes/fixa/:id` | ✅ | `{ nome, valor, categoria, data }` | 204 |
| DELETE | `/transacoes/fixa/:id` | ✅ | — | 204 |
| POST | `/transacoes/fixa/:id` | ✅ | `{ confirmacao: boolean }` | 200/201 `{}` |
| GET | `/metas` | ✅ | — | 200 `{ "metas": [...] }` |
| GET | `/metas/:id` | ✅ | — | 200 `{ id, nome, valor, guardado, porcentagem }` |
| POST | `/metas` | ✅ | `{ nome, valor, guardado }` | 201 `{}` |
| PUT | `/metas/:id` | ✅ | `{ nome, valor, adicionar, subtrair }` | 204 |
| DELETE | `/metas/:id` | ✅ | — | 204 |
| GET | `/relatorios` | ✅ **premium** | — | 200 `text/plain` (CSV) / 403 corpo vazio |
| PATCH | `/admin/usuario/:id` | `senhaAdmin` | `{ senhaAdmin, premium }` | 200 / 404 |

> **Observação:** O campo `valor` nas requisições usa vírgula como separador decimal (ex: `"300,50"`). O campo `rendaMensal` no cadastro aceita tanto ponto quanto vírgula.

---

## 6. Camadas do Código

### 6.1 Entrada (`app.ts` e `server.ts`)

- **`app.ts`** — Cria a instância do Express, registra os middlewares globais (`cors`, `express.json()`) e monta os roteadores nos prefixos:
  - `/` para rotas de usuário (cadastro, login, info e listagem)
  - `/transacoes` para operações com transações (normais e fixas)
  - `/metas` para operações com metas
  - `/relatorios` para geração de relatório
  - `/` para rota de admin (`/admin/usuario/:id`)
- **`server.ts`** — Lê a porta da variável de ambiente `PORT` (default 3000) e inicia o servidor.

### 6.2 Config (`config/`)

- **`database.ts`** — Implementa um singleton `getDatabase()` que:
  1. Abre (ou cria) o arquivo `granaconta.db` com `better-sqlite3`.
  2. Ativa WAL mode e `foreign_keys = ON`.
  3. Executa o DDL do `schema.sql` com `CREATE TABLE IF NOT EXISTS`.
  4. Executa migrações incrementais (`runMigrations()`) para bancos já existentes (ex: adicionar coluna `premium`).
- **`schema.sql`** — Contém as instruções DDL para criar as 5 tabelas e inserir as categorias padrão (com `INSERT OR IGNORE`).

### 6.3 Tipos Compartilhados (`types/index.ts`)

Define interfaces TypeScript usadas em todo o projeto:
- `UsuarioRow` — inclui `premium: number`
- `CategoriaRow`, `TransacaoRow`, `MetaFinanceiraRow` — linhas do banco
- `TransacaoComCategoria` — transação com nome da categoria (JOIN)
- `TransacaoFixaRow`, `TransacaoFixaResponse` — transação fixa (valor absoluto, data DD)
- `TransacaoResponse`, `MetaResponse` — formato de resposta da API (valores formatados como string)
- Extensão global do `Express.Request` para incluir `usuarioId?: number`

### 6.4 Middleware de Autenticação (`middleware/`)

- **`auth.ts`** — `authMiddleware`: Extrai o token do header `Authorization: Bearer <token>`, consulta o banco via `findUsuarioByToken` e, se válido, anexa `req.usuarioId` com o ID do usuário. Responde 401 se o token estiver ausente ou inválido.
- **`adminAuth.ts`** — `adminAuthMiddleware`: Valida que o corpo da requisição contém `senhaAdmin` igual a `"1234"`. Retorna **404** (mesmo código para senha errada) por segurança.

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

- **`Usuario.ts`**: `createUsuario`, `findUsuarioByEmail`, `findUsuarioById`, `updateToken`, `listUsuarios`, `updatePremiumStatus`
- **`Transacao.ts`**: `createTransacao`, `findTransacaoById`, `listTransacoesByUsuario` (JOIN com categorias), `updateTransacao`, `deleteTransacao`
- **`TransacaoFixa.ts`**: `createTransacaoFixa`, `findTransacaoFixaById`, `listTransacoesFixasByUsuario` (JOIN com categorias), `updateTransacaoFixa`, `deleteTransacaoFixa`
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

**Controllers específicos:**

- **`TransacaoFixaController`**:
  - `listar` — GET /transacoes/fixas
  - `criar` — POST /transacoes/fixas (valida categoria = Renda fixa/Despesa fixa, valor > 0, data DD)
  - `editar` — PUT /transacoes/fixa/:id
  - `excluir` — DELETE /transacoes/fixa/:id
  - `confirmar` — POST /transacoes/fixa/:id (confirmacao: true → cria transação normal com data DD+MM+AAAA; false → apenas 200)

- **`AdminController`**:
  - `alterarPremium` — PATCH /admin/usuario/:id (altera status premium, retorna 404 se usuário não existir)

- **`RelatorioController`** (modificado):
  - `gerar` — Verifica se usuário é premium antes de gerar CSV. Se não for premium → 403 corpo vazio.

### 6.8 Routes (`routes/`)

Cada arquivo de rota cria um `Router` do Express e define os endpoints:
- **`usuarioRoutes.ts`**: `POST /usuarios`, `POST /usuarios/login` (públicos), `GET /usuarios`, `GET /usuario` (protegidos)
- **`transacaoRoutes.ts`**: Rotas normais + fixas:
  - Rotas fixas (`/fixas`, `/fixa/:id`) são declaradas **antes** das rotas genéricas (`/:id`) para evitar conflito de rota no Express
  - Todas protegidas por `authMiddleware`
- **`metaRoutes.ts`**: CRUD completo sob `/metas` (todos protegidos)
- **`relatorioRoutes.ts`**: `GET /` sob `/relatorios` (protegido, requer premium)
- **`adminRoutes.ts`**: `PATCH /admin/usuario/:id` (autenticado via `adminAuthMiddleware`)

---

## 7. Fluxo de Autenticação

1. **Cadastro** (`POST /usuarios`): Gera um UUID, salva o usuário com o token, retorna o token.
2. **Login** (`POST /usuarios/login`): Verifica email + senha, gera novo UUID, atualiza o token no banco, retorna o token.
3. **Requisições protegidas**: O middleware `authMiddleware` extrai o token do header `Authorization`, busca o usuário no banco e injeta `req.usuarioId`. Se o token não existir no banco, retorna 401.
4. **Admin** (`PATCH /admin/usuario/:id`): O middleware `adminAuthMiddleware` verifica se `senhaAdmin === "1234"`. Se inválido, retorna 404.

> **Nota:** A senha não é hasheada — é armazenada e comparada em texto puro. Isso é uma limitação de segurança atual.

---

## 8. Transações Fixas Recorrentes

### 8.1 Conceito

Transações fixas representam compromissos financeiros que se repetem mensalmente na mesma data (ex: salário dia 5, aluguel dia 10). Diferem das transações normais por:
- Armazenarem **apenas o dia do mês** (formato `DD`) como data
- Possuírem **categoria restrita** a "Renda fixa" (receita) ou "Despesa fixa" (despesa)
- O valor armazenado é sempre **positivo** (magnitude); o sinal é inferido da categoria

### 8.2 Fluxo de Confirmação Mensal

Cada mês, o sistema permite que o usuário confirme se a transação fixa ocorreu:

1. Usuário envia `POST /transacoes/fixa/:id` com `{ confirmacao: true }`
2. O sistema cria uma **transação normal** em `transacoes` com:
   - Data completa: `DD (da fixa) + MM (atual) + AAAA (atual)` → `DD-MM-AAAA`
   - Valor com sinal: se "Renda fixa" → positivo; se "Despesa fixa" → negativo
   - Mesma categoria e nome da fixa
3. Se `confirmacao: false`, o sistema apenas retorna 200 (ignora a ocorrência)

### 8.3 Categorias Permitidas

| Categoria | Tipo | Sinal na confirmação |
|-----------|------|---------------------|
| Renda fixa | Receita | Positivo |
| Despesa fixa | Despesa | Negativo |

---

## 9. Sistema Premium

### 9.1 Coluna `premium`

A tabela `usuarios` possui a coluna `premium INTEGER NOT NULL DEFAULT 0`:
- `0` — Usuário comum (sem acesso a relatórios)
- `1` — Usuário premium (acesso liberado)

### 9.2 Impacto nas Rotas

| Rota | Comportamento para não-premium |
|------|-------------------------------|
| `GET /relatorios` | **403** com corpo vazio |

### 9.3 Rota de Admin

`PATCH /admin/usuario/:id` — permite alterar o status premium de qualquer usuário:

- **Autenticação**: campo `senhaAdmin` no JSON do body deve ser `"1234"`
- **Body**: `{ "senhaAdmin": "1234", "premium": 1 }`
- **Respostas**:
  - `200` — status alterado com sucesso
  - `404` — senha incorreta **ou** usuário não encontrado (mesmo código, por segurança)
  - `400` — premium inválido ou ID inválido

---

## 10. Relatório CSV

A rota `GET /relatorios` retorna um CSV textual (`Content-Type: text/plain`) com 5 seções separadas por linhas em branco:
1. **Tabela: Despesas** — lista de despesas com valor absoluto + soma total
2. **Tabela: Receitas** — lista de receitas + soma total
3. **Tabela: Despesa por Categoria** — agrupamento de despesas
4. **Tabela: Receita por Categoria** — agrupamento de receitas
5. **Tabela: Lista de Metas** — nome, valor guardado e valor faltante de cada meta

> **Restrição:** Apenas usuários premium podem acessar esta rota. Usuários comuns recebem **403** com corpo vazio.

---

## 11. Como Executar

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

O servidor iniciará na porta definida em `PORT` (ambiente) ou 3000.

---

## 12. Considerações Finais

- O banco SQLite é criado automaticamente na primeira execução (arquivo `granaconta.db` na raiz do projeto).
- Na primeira execução, o schema já inclui a coluna `premium` (tabela criada do zero). Em bancos existentes, a migração é aplicada automaticamente via `ALTER TABLE` dentro de `try/catch`.
- Categorias novas podem ser criadas dinamicamente via `POST /transacoes` ou `PUT /transacoes/:id` — se a categoria informada não existir, ela é criada automaticamente.
- Transações fixas **não criam** categorias automaticamente — apenas "Renda fixa" e "Despesa fixa" são aceitas.
- Os valores monetários trafegam como string no formato brasileiro (vírgula como separador decimal) nas respostas e aceitam ponto ou vírgula nas requisições.
- O pacote `json2csv` está listado nas dependências mas não é utilizado no código atual — a geração do CSV é feita manualmente no `CsvExporter.ts`.
- As rotas de transação fixa (`/fixas`, `/fixa/:id`) são registradas **antes** das rotas genéricas (`/:id`) no router para evitar que o Express interprete o path `fixa` como um parâmetro `:id`.
