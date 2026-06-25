| Método | Rota | Autenticação | Request Body | Response |
|--------|------|--------------|--------------|----------|
| POST | /usuarios | ❌ | { nome, email, senha, rendaMensal } | 201 { "token": "..." } |
| POST | /usuarios/login | ❌ | { email, senha } | 200 { "token": "..." } |
| GET | /usuarios | ✅ | — | 200 { "usuarios": [...] } |
| GET | /usuario | ✅ | — | 200 { nome, email, rendaMensal } |
| GET | /transacoes | ✅ | — | 200 { "transações": [...] } |
| POST | /transacoes | ✅ | { nome, valor, categoria, data } | 201 {} |
| PUT | /transacoes/:id | ✅ | { nome, valor, categoria } (sem data) | 204 {} |
| DELETE | /transacoes/:id | ✅ | — | 204 {} |
| GET | /metas | ✅ | — | 200 { "metas": [...] } |
| GET | /metas/:id | ✅ | — | 200 { id, nome, valor, guardado, porcentagem } |
| POST | /metas | ✅ | { nome, valor, guardado } | 201 {} |
| PUT | /metas/:id | ✅ | { nome, valor, adicionar, subtrair } | 204 {} |
| DELETE | /metas/:id | ✅ | — | 204 {} |
| GET | /relatorios | ✅ | — | 200 CSV text/plain |