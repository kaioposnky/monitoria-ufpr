# Autenticação JWT, RBAC e Swagger

O backend usa Spring Security em modo stateless com tokens JWT (HMAC-SHA256) e senhas com hash BCrypt.

## Banco e usuários de desenvolvimento

- Migration `V3__add_usuario_senha_hash.sql` adiciona `senha_hash VARCHAR(255) NOT NULL` em `usuarios`.
- Os usuários semeados em `V2__seed_dummy_data.sql` recebem a senha `monitoria123` em hash BCrypt.
- `CadastroUsuarioDTO` exige `senha` com pelo menos 6 caracteres; `AtualizacaoUsuarioDTO` aceita `tipoUsuario` e `senha` opcionais.

## Endpoints de autenticação (`/api/v1/auth`)

- `POST /api/v1/auth/login` (público): valida `email` + `senha` de usuário ativo e devolve `{ token, usuario }`.
- `GET /api/v1/auth/me` (autenticado): devolve `AuthUserDTO` com a flag `monitor` (`true` quando usuário `ALUNO` tem vínculo `ATIVO` em `monitores`).

Credenciais inválidas retornam HTTP 401 (`UNAUTHORIZED`). Rotas protegidas sem token retornam HTTP 401 (`NAO_AUTENTICADO`), e violações de permissão retornam HTTP 403 (`ACESSO_NEGADO`).

## Matriz de permissões (RBAC)

A distinção entre `ALUNO` e `MONITOR` é avaliada por requisição no bean `AccessGuard` (`@accessGuard`), que consulta o status `ATIVO` em `monitores` e a posse do recurso:

| Operação | Público | `ALUNO` | `MONITOR` (`ATIVO`) | `PROFESSOR` | `ADMIN` |
| --- | --- | --- | --- | --- | --- |
| `POST /api/v1/auth/login` | Sim | Sim | Sim | Sim | Sim |
| `GET /api/v1/auth/me` | Não | Sim | Sim | Sim | Sim |
| `GET` catálogo e agenda (`cursos`, `disciplinas`, `materias`, `cursos-disciplinas`, `vagas-monitoria`, `horarios-atendimento`, `agenda`) | Sim | Sim | Sim | Sim | Sim |
| `GET /api/v1/monitores/**` | Não | Sim | Sim | Sim | Sim |
| `POST / PUT / PATCH / DELETE` em `cursos`, `disciplinas`, `materias`, `usuarios` | Não | Não | Não | Não | Sim |
| `POST / DELETE` em `cursos-disciplinas` | Não | Não | Não | Não | Sim |
| `GET /api/v1/usuarios` | Não | Não | Não | Sim | Sim |
| `GET /api/v1/usuarios/{id}` | Não | Próprio | Próprio | Sim | Sim |
| `POST / PUT / PATCH / DELETE` em `vagas-monitoria` | Não | Não | Não | Suas vagas | Sim |
| `POST / PUT / PATCH / DELETE` em `candidaturas` | Não | Próprias | Próprias | Não | Sim |
| `GET /api/v1/candidaturas` e `GET /vaga/{vagaId}` | Não | Não | Não | Sim | Sim |
| `GET /api/v1/candidaturas/{id}` e `GET /aluno/{alunoId}` | Não | Próprias | Próprias | Sim | Sim |
| `PATCH /api/v1/candidaturas/{id}/status` | Não | Não | Não | Suas vagas | Sim |
| `POST / PUT / PATCH / DELETE` em `monitores` | Não | Não | Não | Suas vagas | Sim |
| `POST / PUT / PATCH / DELETE` em `horarios-atendimento` | Não | Não | Próprios | Suas vagas | Sim |
| `GET /api/v1/registros-atividades` | Não | Não | Não | Sim | Sim |
| `GET /{id}`, `GET /monitor/{monitorId}` e `POST / PUT / PATCH / DELETE` em `registros-atividades` | Não | Não | Próprios | Suas vagas | Sim |
| `PATCH /api/v1/registros-atividades/{id}/aprovacao` | Não | Não | Não | Suas vagas | Sim |

## CORS e Swagger

- `CorsConfig` libera `http://localhost:4200` e `http://localhost:5173`.
- `OpenApiConfig` registra o esquema `bearerAuth` (JWT Bearer) em `/swagger-ui.html` e `/v3/api-docs`.

## Verificação

Comando: `cd backend && ./mvnw test`.
- `AuthAndRbacIntegrationTest` e `VerticalSliceAndBusinessRulesIntegrationTest` sobem o contexto com perfil `dev` (H2 em memória e Flyway `V1`–`V5`).
- `SistemaApplicationTests` e `CacheAsideIntegrationTest` sobem com perfil `test` (`ddl-auto=create-drop`, sem Flyway).
- `ExternalIntegrationsTest` testa adaptadores, seleção condicional de beans e falha externa simulada sem banco completo.
