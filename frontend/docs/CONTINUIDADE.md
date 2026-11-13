# Frontend: estado atual e guia de manutenção

## 1. Fluxos e rotas integradas

| Rota | Acesso | Endpoints `/api/v1` usados |
| --- | --- | --- |
| `/courses`, `/subjects`, `/course-subjects`, `/monitoring-vacancies`, `/monitoring-vacancies/:id` | Público | `GET /cursos`, `/materias`, `/cursos-materias`, `/vagas-monitoria`, `/vagas-monitoria/{id}` |
| `/office-hours` | Leitura pública; escrita `MONITOR` ativo, `PROFESSOR` ou `ADMIN` | `GET /horarios-atendimento`, `/agenda/eventos`, `/agenda/calendario.ics`, `/vagas-monitoria`, `/materias`, `/monitores` (ou `/monitores/aluno/{id}` se `ALUNO`) e `/usuarios` (somente para `PROFESSOR` ou `ADMIN`); `POST`/`DELETE /horarios-atendimento` |
| `/login` | Público | `POST /auth/login`, `GET /auth/me` |
| `/applications/new` | `ALUNO` ou `ADMIN` | `GET /vagas-monitoria`, `/materias`, `/usuarios` (se `ADMIN`); `POST /candidaturas` |
| `/management/vacancies/new` | `PROFESSOR` ou `ADMIN` | `GET /materias`, `/usuarios` (se `ADMIN`); `POST /vagas-monitoria` |
| `/management/monitors/review` | `PROFESSOR` ou `ADMIN` | `GET /candidaturas`, `/vagas-monitoria`, `/materias`, `/usuarios`; `PATCH /candidaturas/{id}/status` |
| `/management` | Autenticado | `GET /vagas-monitoria`, `/materias`, `/candidaturas` (ou `/candidaturas/aluno/{id}`), `/monitores` (ou `/monitores/aluno/{id}`), `/usuarios` (se staff), `/registros-atividades` (ou `/registros-atividades/monitor/{id}`); escrita em vagas (`PUT`, `PATCH`, `DELETE`), candidaturas (`PATCH /{id}/status`, `DELETE`), monitores (`POST`, `PUT`, `DELETE`) e registros (`POST`, `PATCH /{id}/aprovacao`, `DELETE`) |
| `/admin` | `ADMIN` | `GET/POST/PUT/DELETE` em `/cursos`, `/materias` e `/usuarios`; `GET/POST/DELETE` em `/cursos-materias` |

## 2. Onde mexer (`frontend/src/`)

| Alteração | Arquivos |
| --- | --- |
| Rotas e proteção por papel | `app/App.tsx`, `components/RequireAuth/RequireAuth.tsx` |
| Login, token e cabeçalho | `features/auth/AuthContext.tsx`, `features/auth/auth.api.ts`, `components/Header/Header.tsx` |
| Transporte HTTP e estado de consulta | `shared/api/http.ts`, `shared/useQuery.ts` |
| Catálogo | `features/catalog/catalog.types.ts`, `features/catalog/catalog.api.ts`, `features/catalog/catalog.labels.ts` |
| Monitoria, validações e agenda | `features/monitoring/monitoring.types.ts`, `features/monitoring/monitoring.api.ts`, `features/monitoring/monitoring.rules.ts` |
| Formulários e painéis | `components/*Form/`, `components/*Panel/` |
| Layout, navegação e catálogo | `components/AppLayout/`, `Header/`, `Footer/`, `PageHeader/`, `NavigationCard/`, `FormField/`, `QueryResult/`, `EmptyState/`, `VacancyCard/`, `VacancyFilters/`, `VacancyDetails/` |
| Páginas e estilos | `pages/*Page/`, `styles/global.css` |

## 3. Regras de transporte e validação

- `http.ts` envia `Accept: application/json`, adiciona `Content-Type: application/json` quando há corpo, anexa `Authorization: Bearer <token>` se houver sessão e converte erros do `GlobalExceptionHandler` (`mensagem` e `erros`) em `ApiError`.
- O token fica em `localStorage` (`monitoria_auth_token`), com fallback em memória se o storage estiver bloqueado.
- `useQuery` cancela requisições pendentes via `AbortSignal` ao desmontar ou trocar a função de carga; após alterações, a tela recarrega via `query.retry()` (não há retry automático de rede).
- Validações locais (`monitoring.rules.ts`) checam formato de semestre (`AAAA/1` ou `AAAA/2`), intervalo opcional `dataEncerramento >= dataAbertura`, `horaFim > horaInicio`, nota/CR entre `0` e `100` e URL `http://` ou `https://`. As validações definitivas ficam no backend.

## 4. Verificação

```bash
cd frontend
npm run build
npm test
npm run lint
```

Os testes atuais (`http.spec.ts`, `auth.api.spec.ts`, `catalog.api.spec.ts`, `monitoring.api.spec.ts`, `monitoring.rules.spec.ts`) usam `fetch` mockado para contratos HTTP e funções puras. A integração real com Spring e banco H2/PostgreSQL é exercitada nos testes de integração do backend (`cd backend && ./mvnw test`) e rodando `npm run start:all`.
