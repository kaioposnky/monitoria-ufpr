# Organização do frontend

```text
frontend/
├── AGENTS.md                          # Convenções e instruções para agentes
├── docs/
│   ├── CONTINUIDADE.md                # Regras, contratos, decisões e manutenção
│   └── DECISOES.md                    # Escolhas adotadas e pendências para análise
├── index.html                         # Documento HTML de entrada
├── package.json                       # Dependências e comandos
├── package-lock.json                  # Versões resolvidas das dependências
├── tsconfig.json                      # Configuração TypeScript
├── vite.config.ts                     # Vite e proxy de desenvolvimento
├── vitest.config.ts                   # Configuração dos testes
└── src/
    ├── main.tsx                       # Inicialização do React e BrowserRouter
    ├── app/
    │   └── App.tsx                    # Composição das rotas
    ├── pages/                         # Uma página por pasta
    │   ├── HomePage/HomePage.tsx
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
    │   ├── IntegrationNotice/IntegrationNotice.tsx
    │   ├── VacancyCard/VacancyCard.tsx
    │   ├── VacancyFilters/VacancyFilters.tsx
    │   ├── VacancyDetails/VacancyDetails.tsx
    │   ├── ApplicationForm/ApplicationForm.tsx
    │   ├── VacancyForm/VacancyForm.tsx
    │   ├── OfficeHoursForm/OfficeHoursForm.tsx
    │   ├── MonitorReviewForm/MonitorReviewForm.tsx
    │   └── DraftReview/DraftReview.tsx
    ├── features/                      # Contratos, consultas e regras por assunto
    │   ├── catalog/
    │   │   ├── catalog.api.ts         # Consultas à API de catálogo
    │   │   ├── catalog.types.ts       # Tipos dos dados do catálogo
    │   │   └── catalog.labels.ts      # Rótulos e opções de apresentação
    │   └── monitoring/
    │       ├── monitoring.types.ts    # Tipos dos rascunhos
    │       ├── monitoring.rules.ts    # Validação e formatação
    │       └── useDraftReview.ts      # Transição entre edição e revisão
    ├── shared/                       # Código transversal sem interface visual
    │   ├── useQuery.ts               # Estado e cancelamento das consultas
    │   └── api/
    │       ├── http.ts               # Transporte HTTP e erros
    │       └── http.spec.ts          # Testes do contrato de transporte
    └── styles/
        └── global.css               # Estilos comuns e responsividade
```

| Pasta | Responsabilidade |
|---|---|
| `app` | Conectar as páginas às rotas. |
| `pages/NomePage` | Coordenar os dados e compor a tela de uma rota. |
| `components/Nome` | Encapsular apresentação e interação reutilizável ou específica de um fluxo. |
| `features/assunto` | Concentrar tipos compartilhados, consultas, regras de preenchimento e hooks do assunto. |
| `shared` | Concentrar infraestrutura e comportamento transversal não visual. |
| `styles` | Concentrar os estilos comuns da interface. |
