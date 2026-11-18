# Sistema de Monitoria Acadêmica (UFPR Exatas)

Projeto de controle de monitorias para o Setor de Ciências Exatas da UFPR (cadastro de vagas, candidaturas, efetivação de monitores, grade de horários e registro de atividades).

Estrutura: API REST em Spring Boot organizada em camadas (com `Notificador` e `ServicoAgenda` isolando chamadas externas) e SPA em React + TypeScript consumindo `/api/v1/**`.

## Arquivos do projeto

- [especificacao_da_prof.md](especificacao_da_prof.md): enunciado da disciplina.
- [docs/requisitos.md](docs/requisitos.md): contexto, atores, requisitos funcionais (`RF01` a `RF08`), requisitos de qualidade (`RQ01` a `RQ07`, incluindo 3 ASRs) e restrições (`RT01` a `RT03`).
- [docs/arquitetura.md](docs/arquitetura.md): domínio, responsabilidades, estrutura das camadas, endpoints, integrações externas e cenários de evolução.
- [docs/tradeoffs.md](docs/tradeoffs.md): comparação entre alternativas arquiteturais.
- [docs/adr/](docs/adr): decisões arquiteturais (`ADR-001` a `ADR-007`).
- [diagramas/](diagramas): diagramas Excalidraw (`classes.excalidraw`, `sequencia.excalidraw`, `comunicacao.excalidraw`, `componentes.excalidraw`).
- [MODELAGEM_BANCO.md](MODELAGEM_BANCO.md): esquema relacional e dicionário de dados (`V1` a `V5`).
- [backend/](backend) e [frontend/](frontend): código-fonte da API e da SPA.

Notas técnicas por módulo: [autenticacao-rbac-swagger.md](backend/docs/autenticacao-rbac-swagger.md), [cache.md](backend/docs/cache.md), [frontend/AGENTS.md](frontend/AGENTS.md), [CONTINUIDADE.md](frontend/docs/CONTINUIDADE.md), [DECISOES.md](frontend/docs/DECISOES.md) e [INTEGRACAO_ESCRITA_ADMIN.md](frontend/docs/INTEGRACAO_ESCRITA_ADMIN.md).

## Stack

| Parte | O que usa | Notas |
| --- | --- | --- |
| Backend | Java 21, Spring Boot 4.1.2, Maven | Pacote raiz `com.sistema` (`controller`, `service`, `repository`, `entity`, `dto`, `security`, `integration`, `exception`, `config`) |
| Banco | PostgreSQL (padrão) ou H2 (`dev` e `test`) | `dev` e PostgreSQL usam Flyway (`V1`–`V5`); `test` usa `ddl-auto=create-drop` |
| Segurança | Spring Security, JWT (HMAC-SHA256), BCrypt | Autenticação stateless via `Authorization: Bearer` e RBAC no `AccessGuard` |
| Cache | Spring Cache (`simple` / `ConcurrentMapCacheManager`) | Cache-aside em memória para catálogo, vagas, monitores e horários |
| Integrações | `Notificador`, `ServicoAgenda` | Selecionáveis via `app.integracoes.*` (`fake`/`email`, `simulada`/`ics`) |
| Frontend | React 19, TypeScript, Vite 8, React Router 7 | Proxy `/api` para `localhost:8080` em dev |
| Documentação API | Springdoc OpenAPI | `/swagger-ui.html` e `/v3/api-docs` |

## Como rodar local

### Sem PostgreSQL (perfil `dev` em H2)

Precisa de Java 21 e Node.js. Na raiz:

```bash
npm install
npm --prefix frontend install
npm run start:all
```

O backend sobe em `http://localhost:8080` com H2 em memória, aplica `V1`–`V5` e cria usuários de teste (senha `monitoria123`). O frontend fica em `http://localhost:5173`.

Só o backend:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Healthcheck: `http://localhost:8080/actuator/health`.

Se abrir o frontend em outro host ou porta, inclua a origem exata em `APP_CORS_ALLOWED_ORIGINS` antes de iniciar o backend. A variável substitui a lista padrão; por exemplo, `APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:45173` mantém a origem local e permite a alternativa.

### Com PostgreSQL

O perfil padrão espera `jdbc:postgresql://localhost:5432/monitoria_ufpr` com usuário `postgres` (ver `.env.example`). Variáveis configuráveis no ambiente:

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/monitoria_ufpr'
export SPRING_DATASOURCE_USERNAME='postgres'
export SPRING_DATASOURCE_PASSWORD='sua-senha-local'
# Opcionais:
export SPRING_CACHE_TYPE='simple'
export APP_SECURITY_JWT_SECRET='chave-hmac-com-pelo-menos-32-bytes'
export APP_NOTIFICADOR='fake'
export APP_AGENDA='simulada'

cd backend && ./mvnw spring-boot:run
```

## Testes

```bash
cd backend && ./mvnw test
```

```bash
cd frontend
npm run build
npm test
npm run lint
```
