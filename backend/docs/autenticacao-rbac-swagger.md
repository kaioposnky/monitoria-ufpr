# Autenticação JWT, Controle de Acesso (RBAC) e Swagger

## Visão geral

O backend utiliza **Spring Security** em modo *stateless* com tokens **JWT (HMAC-SHA256)** e criptografia de senhas via **BCrypt**.

---

## Banco de dados e usuários de desenvolvimento

- **Migration:** `backend/src/main/resources/db/migration/V3__add_usuario_senha_hash.sql`
- Adiciona a coluna `senha_hash VARCHAR(255) NOT NULL` na tabela `usuarios`.
- Preenche os usuários semeados em `V2__seed_dummy_data.sql` com a senha padrão de desenvolvimento **`monitoria123`** (em hash BCrypt).
- `CadastroUsuarioDTO` exige `senha` (mínimo 6 caracteres); `AtualizacaoUsuarioDTO` aceita `tipoUsuario` e `senha` opcionais.

---

## Endpoints de autenticação (`/api/v1/auth`)

| Método | Caminho | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Público | Valida `email` + `senha` de usuário ativo e retorna `{ token, usuario }`. |
| `GET` | `/api/v1/auth/me` | Autenticado | Retorna `AuthUserDTO` do usuário autenticado, incluindo a flag `monitor` (`true` quando `ALUNO` possui vínculo `ATIVO` em `monitores`). |

Credenciais inválidas retornam **HTTP 401** com código `UNAUTHORIZED`. Requisições sem token em rotas protegidas retornam **HTTP 401** (`NAO_AUTENTICADO`), e violações de permissão retornam **HTTP 403** (`ACESSO_NEGADO`).

---

## Matriz de permissões (RBAC)

A diferenciação entre **`ALUNO`** e **`MONITOR`** é verificada dinamicamente por `AccessGuard` (`@accessGuard`) usando o vínculo ativo na tabela `monitores` e a propriedade dos recursos:

| Recurso / Operação | Público | `ALUNO` | `MONITOR` *(vínculo `ATIVO`)* | `PROFESSOR` | `ADMIN` |
| --- | :---: | :---: | :---: | :---: | :---: |
| `POST /api/v1/auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/auth/me` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `GET` Catálogo (`cursos`, `materias`, `cursos-materias`, `vagas-monitoria`, `horarios-atendimento`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST / PUT / PATCH / DELETE` em `cursos`, `materias`, `cursos-materias`, `usuarios` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `GET /api/v1/usuarios` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /api/v1/usuarios/{id}` | ❌ | ✅ (próprio) | ✅ (próprio) | ✅ | ✅ |
| `POST / PUT / PATCH / DELETE` em `vagas-monitoria` | ❌ | ❌ | ❌ | ✅ (suas vagas) | ✅ |
| `POST / PUT / PATCH / DELETE` em `candidaturas` | ❌ | ✅ (própria) | ✅ (própria) | ❌ | ✅ |
| `GET /api/v1/candidaturas/**` e `PATCH /{id}/status` | ❌ | ✅ (próprias) | ✅ (próprias) | ✅ | ✅ |
| `POST / PUT / PATCH / DELETE` em `horarios-atendimento` | ❌ | ❌ | ✅ (próprios) | ✅ (suas vagas) | ✅ |
| `POST / PUT / PATCH / DELETE` em `registros-atividades` | ❌ | ❌ | ✅ (próprios) | ✅ (suas vagas) | ✅ |
| `PATCH /api/v1/registros-atividades/{id}/aprovacao` | ❌ | ❌ | ❌ | ✅ (suas vagas) | ✅ |
| `POST / PUT / PATCH / DELETE` em `monitores` | ❌ | ❌ | ❌ | ✅ (suas vagas) | ✅ |

---

## CORS e Swagger / OpenAPI

- `CorsConfig` permite origens `http://localhost:4200` e `http://localhost:5173`.
- `OpenApiConfig` configura o esquema de segurança `bearerAuth` (JWT Bearer) e todos os controllers contam com anotações `@Tag` e `@Operation` em português em `/swagger-ui.html` e `/v3/api-docs`.

---

## Verificação

- Executado `cd backend && ./mvnw test`: **5 testes executados, 0 falhas, 0 erros** (`SistemaApplicationTests` e `AuthAndRbacIntegrationTest` no perfil `dev` com Flyway `V1`–`V3`).
