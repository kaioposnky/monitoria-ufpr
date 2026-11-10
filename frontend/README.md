# Organização do frontend

```text
frontend/
├── AGENTS.md                          # Convenções e instruções para agentes
├── docs/
│   ├── CONTINUIDADE.md                # Regras, contratos, decisões e manutenção
│   ├── DECISOES.md                    # Escolhas adotadas e pendências para análise
│   └── INTEGRACAO_ESCRITA_ADMIN.md    # Documentação da integração de escrita, gestão, auth e admin
├── index.html                         # Documento HTML de entrada
├── package.json                       # Dependências e comandos
├── package-lock.json                  # Versões resolvidas das dependências
├── tsconfig.json                      # Configuração TypeScript
├── vite.config.ts                     # Vite e proxy de desenvolvimento
├── vitest.config.ts                   # Configuração dos testes
└── src/
    ├── main.tsx                       # Inicialização do React, BrowserRouter e AuthProvider
    ├── app/
    │   └── App.tsx                    # Composição das rotas públicas e protegidas
    ├── pages/                         # Uma página por pasta
    │   ├── HomePage/HomePage.tsx
    │   ├── LoginPage/LoginPage.tsx
    │   ├── CoursesPage/CoursesPage.tsx
    │   ├── SubjectsPage/SubjectsPage.tsx
    │   ├── CourseSubjectsPage/CourseSubjectsPage.tsx
    │   ├── VacanciesPage/VacanciesPage.tsx
    │   ├── VacancyDetailsPage/VacancyDetailsPage.tsx
    │   ├── ApplicationPage/ApplicationPage.tsx
    │   ├── OfficeHoursPage/OfficeHoursPage.tsx
    │   ├── ManagementPage/ManagementPage.tsx
    │   ├── NewVacancyPage/NewVacancyPage.tsx
    │   ├── MonitorReviewPage/MonitorReviewPage.tsx
    │   ├── AdminPage/AdminPage.tsx
    │   └── NotFoundPage/NotFoundPage.tsx
    ├── components/                    # Um componente por pasta
    │   ├── AppLayout/AppLayout.tsx
    │   ├── Header/Header.tsx
    │   ├── Footer/Footer.tsx
    │   ├── PageHeader/PageHeader.tsx
    │   ├── NavigationCard/NavigationCard.tsx
    │   ├── FormField/FormField.tsx
    │   ├── QueryResult/QueryResult.tsx
    │   ├── EmptyState/EmptyState.tsx
    │   ├── RequireAuth/RequireAuth.tsx
    │   ├── VacancyCard/VacancyCard.tsx
    │   ├── VacancyFilters/VacancyFilters.tsx
    │   ├── VacancyDetails/VacancyDetails.tsx
    │   ├── ApplicationForm/ApplicationForm.tsx
    │   ├── VacancyForm/VacancyForm.tsx
    │   ├── OfficeHoursForm/OfficeHoursForm.tsx
    │   ├── MonitorReviewForm/MonitorReviewForm.tsx
    │   ├── MonitorsPanel/MonitorsPanel.tsx
    │   ├── ActivityLogsPanel/ActivityLogsPanel.tsx
    │   ├── AdminCatalogPanel/AdminCatalogPanel.tsx
    │   └── AdminUsersPanel/AdminUsersPanel.tsx
    ├── features/                      # Contratos, consultas e regras por assunto
    │   ├── auth/
    │   │   ├── auth.types.ts          # Tipos de usuário autenticado e login
    │   │   ├── auth.api.ts            # Chamadas /auth/login e /auth/me
    │   │   └── AuthContext.tsx        # Sessão JWT e hook useAuth
    │   ├── catalog/
    │   │   ├── catalog.api.ts         # Consultas ao catálogo acadêmico
    │   │   ├── catalog.types.ts       # Tipos dos dados do catálogo
    │   │   └── catalog.labels.ts      # Rótulos e opções de apresentação
    │   └── monitoring/
    │       ├── monitoring.api.ts      # Operações CRUD e escrita de monitoria/admin
    │       ├── monitoring.types.ts    # Tipos de domínio e formulários
    │       └── monitoring.rules.ts    # Validação, rótulos e formatação
    ├── shared/                       # Código transversal sem interface visual
    │   ├── useQuery.ts               # Estado e cancelamento das consultas
    │   └── api/
    │       ├── http.ts               # Transporte HTTP (GET/POST/PUT/PATCH/DELETE), Bearer token e erros
    │       └── http.spec.ts          # Testes do contrato de transporte
    └── styles/
        └── global.css               # Estilos comuns e responsividade
```

| Pasta | Responsabilidade |
|---|---|
| `app` | Conectar as páginas às rotas e guardas de acesso. |
| `pages/NomePage` | Coordenar os dados e compor a tela de uma rota. |
| `components/Nome` | Encapsular apresentação e interação reutilizável ou específica de um fluxo. |
| `features/assunto` | Concentrar tipos compartilhados, consultas, mutações e regras do assunto. |
| `shared` | Concentrar infraestrutura e comportamento transversal não visual. |
| `styles` | Concentrar os estilos comuns da interface. |
