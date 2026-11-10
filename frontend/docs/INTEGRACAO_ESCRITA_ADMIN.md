# Integração de Escrita, Gerenciamento Completo, Autenticação e Página de Admin

## O que foi implementado

### 1. Transporte HTTP e Autenticação (`src/shared/api/http.ts`, `src/features/auth/`)
- Adicionados os métodos `postJson`, `putJson`, `patchJson` e `deleteRequest` em `http.ts`.
- Envio automático do cabeçalho `Authorization: Bearer <token>` a partir da sessão persistida (com fallback em memória quando `localStorage` estiver indisponível).
- Leitura estruturada de erros do `GlobalExceptionHandler` (`mensagem` e `erros` por campo) para exibição direta nos formulários.
- Criados `auth.types.ts`, `auth.api.ts`, `AuthContext.tsx`, `RequireAuth.tsx` e `LoginPage.tsx` (`/login`) com contas de demonstração para o ambiente `dev` (senha padrão `monitoria123`).
- `Header.tsx` exibe o usuário conectado, o papel efetivo (`ALUNO`, `MONITOR`, `PROFESSOR`, `ADMIN`), botão **Sair** e links condicionais para **Gestão** e **Admin**.

### 2. Integração dos Formulários Existentes
Os fluxos antes baseados em rascunho local (`IntegrationNotice` / `DraftReview` / `useDraftReview`, removidos por não serem mais necessários) passaram a persistir diretamente no backend:
- **`VacancyForm.tsx` (`/management/vacancies/new`)**: envia `POST /api/v1/vagas-monitoria`; identifica automaticamente o `professorId` quando o usuário é `PROFESSOR` e oferece seletor de professores para `ADMIN`.
- **`ApplicationForm.tsx` (`/applications/new`)**: envia `POST /api/v1/candidaturas`; identifica automaticamente o `alunoId` para `ALUNO` e oferece seletor de alunos para `ADMIN`.
- **`OfficeHoursPage.tsx` e `OfficeHoursForm.tsx` (`/office-hours`)**: exibe a grade pública via `GET /api/v1/horarios-atendimento` e habilita cadastro (`POST`) e remoção (`DELETE`) para `MONITOR` ativo, `PROFESSOR` e `ADMIN`, substituindo o ID numérico por seletor real de monitores.
- **`MonitorReviewPage.tsx` e `MonitorReviewForm.tsx` (`/management/monitors/review`)**: seleciona candidaturas reais do backend e atualiza o status via `PATCH /api/v1/candidaturas/{id}/status`.

### 3. Gerenciamento Completo (`/management`)
`ManagementPage.tsx`, `MonitorsPanel.tsx` e `ActivityLogsPanel.tsx` fornecem gerenciamento completo adaptado ao perfil autenticado:
- **Vagas (`PROFESSOR` / `ADMIN`)**: listagem, edição completa (`PUT`), alteração rápida de status (`PATCH`: `ABERTA`, `EM_SELECAO`, `ENCERRADA`, `CANCELADA`) e exclusão (`DELETE`).
- **Candidaturas**: alunos acompanham e podem cancelar suas candidaturas; professores e administradores aprovam/reprovam e podem efetivar candidatos aprovados como monitores com um clique.
- **Monitores (`MonitorsPanel`)**: criação de vínculo (`POST /api/v1/monitores`), atualização de status (`ATIVO`, `INATIVO`, `DESLIGADO`, `CONCLUIDO`) e remoção (`DELETE`).
- **Registros de Atividades (`ActivityLogsPanel`)**: monitores ativos registram horas/atividades (`POST /api/v1/registros-atividades`); professores e administradores aprovam ou rejeitam com parecer (`PATCH /api/v1/registros-atividades/{id}/aprovacao`).

### 4. Página de Administração (`/admin`)
`AdminPage.tsx`, `AdminCatalogPanel.tsx` e `AdminUsersPanel.tsx` (protegida por `<RequireAuth roles={['ADMIN']}>`):
- **Cursos**: criar, editar e excluir (`/api/v1/cursos`).
- **Matérias**: criar, editar e excluir (`/api/v1/materias`).
- **Vínculos Curso × Matéria**: vincular e desvincular (`/api/v1/cursos-materias/{cursoId}/{materiaId}`).
- **Usuários**: criar (`ALUNO`, `PROFESSOR`, `ADMIN` com senha inicial), editar dados/perfil/situação ativa/senha e excluir (`/api/v1/usuarios`).

---

## Verificação realizada

Executado em `frontend/`:
- `npm run lint` (`oxlint --type-aware src/`): **0 warnings e 0 errors** em 48 arquivos.
- `npm run build` (`tsc --noEmit && vite build`): **sucesso**.
- `npm test` (`vitest run`): **6 testes passando em `http.spec.ts`** (cobrindo `GET`, `POST`, `PATCH`, `DELETE`, `Authorization: Bearer` e parse de erros do backend).
