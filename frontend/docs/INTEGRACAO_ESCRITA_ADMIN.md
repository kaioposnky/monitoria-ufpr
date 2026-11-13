# Notas de integração: escrita, gestão, login e admin

Referência rápida das telas conectadas às rotas protegidas da API `/api/v1`.

## Transporte e sessão

- `src/shared/api/http.ts` implementa `getJson`, `postJson`, `putJson`, `patchJson` e `deleteRequest`, enviando `Authorization: Bearer <token>` quando autenticado e lendo `mensagem`/`erros` do `GlobalExceptionHandler`.
- `src/features/auth/` (`auth.types.ts`, `auth.api.ts`, `AuthContext.tsx`) mantém a sessão JWT e expõe `user.role` + `user.isMonitor`.
- `LoginPage.tsx` (`/login`) e `Header.tsx` exibem o usuário logado, papel efetivo e links condicionais de Gestão (`/management`) e Admin (`/admin`).

## Fluxos por tela

- `VacancyForm.tsx` (`/management/vacancies/new`): envia `POST /api/v1/vagas-monitoria` com `dataAbertura` e `dataEncerramento` opcionais; usa o usuário logado quando `PROFESSOR` e libera seleção de docente para `ADMIN`.
- `ApplicationForm.tsx` (`/applications/new`): envia `POST /api/v1/candidaturas`; usa o usuário logado para `ALUNO` e libera seleção de aluno para `ADMIN`.
- `OfficeHoursPage.tsx` e `OfficeHoursForm.tsx` (`/office-hours`): lista `GET /api/v1/horarios-atendimento` e `GET /api/v1/agenda/eventos` (com download em `/api/v1/agenda/calendario.ics`), habilitando `POST` e `DELETE` de horários para `MONITOR` ativo, `PROFESSOR` e `ADMIN` (edição direta de horário não foi exposta na UI).
- `MonitorReviewPage.tsx` e `MonitorReviewForm.tsx` (`/management/monitors/review`): carrega candidaturas existentes e altera o status via `PATCH /api/v1/candidaturas/{id}/status`.
- `ManagementPage.tsx` (`/management`):
  - Vagas (`PROFESSOR` dono ou `ADMIN`): edição (`PUT`), troca rápida de status (`PATCH`) e exclusão (`DELETE`).
  - Candidaturas: alunos removem sua candidatura (`DELETE`); staff envia `APROVADO` ou `REPROVADO` (`PATCH /{id}/status`) e efetiva aprovados como monitores (`POST /api/v1/monitores`).
  - Monitores (`MonitorsPanel`) e atividades (`ActivityLogsPanel`): cadastro/atualização/exclusão de vínculos, lançamento de horas (`POST /registros-atividades`) e avaliação docente (`PATCH /registros-atividades/{id}/aprovacao`).
- `AdminPage.tsx` (`/admin`, via `<RequireAuth roles={['ADMIN']}>`): `AdminCatalogPanel` e `AdminUsersPanel` operam `POST`/`PUT`/`DELETE` em `/cursos`, `/materias` e `/usuarios`, e `POST`/`DELETE` em `/cursos-materias/{cursoId}/{materiaId}`.

## Checagens disponíveis em `frontend/`

- `npm run lint` (`oxlint --type-aware src/`): verifica tipagem e regras estáticas em `src/`.
- `npm run build` (`tsc --noEmit && vite build`): checa TypeScript e gera `dist/`.
- `npm test` (`vitest run`): executa os specs unitários e de contrato HTTP (`http.spec.ts`, `auth.api.spec.ts`, `catalog.api.spec.ts`, `monitoring.api.spec.ts`, `monitoring.rules.spec.ts`).
