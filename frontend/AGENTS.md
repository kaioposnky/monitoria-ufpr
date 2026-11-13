# Instruções para agentes no frontend

## Escopo e referências

Estas regras valem para `frontend/`. A interface usa Vite, React, TypeScript e React Router, consumindo apenas o backend Spring Boot em `/api/v1`. Não introduzir NestJS SSR, Next.js ou servidores Node intermediários.

Antes de mexer em um fluxo, ler [docs/requisitos.md](../docs/requisitos.md), [docs/arquitetura.md](../docs/arquitetura.md) e os DTOs/controllers envolvidos no backend.

Consultar [README.md](README.md) para a árvore de pastas, [docs/CONTINUIDADE.md](docs/CONTINUIDADE.md) para endpoints e pontos de manutenção, e [docs/DECISOES.md](docs/DECISOES.md) para as escolhas locais do cliente.

## Organização obrigatória

- Rotas em `src/app/App.tsx`; entrada em `src/main.tsx`.
- Páginas em `src/pages/NomePage/NomePage.tsx`; componentes em `src/components/Nome/Nome.tsx`.
- Usar PascalCase e declaração nomeada `export function Nome(...)` (sem `export default`, arrow exportada ou `React.FC`).
- Declarar tipos de props no próprio `.tsx`. Tipos compartilhados ficam em `src/features/assunto/assunto.types.ts`.
- Chamadas HTTP ficam em `*.api.ts`; validações e formatações em `*.rules.ts`.
- Hooks usam prefixo `use`; hooks transversais ficam em `shared/`.
- Usar imports diretos, sem arquivos barrel (`index.ts`).
- Estilos comuns ficam em `src/styles/global.css`.
- Testes ficam junto ao módulo com sufixo `.spec.ts`.

Exemplo:

```tsx
import type { ReactNode } from 'react';

type Props = {
  title: string;
  children?: ReactNode;
};

export function ExamplePanel({ title, children }: Props) {
  return <section><h2>{title}</h2>{children}</section>;
}
```

## Responsabilidades e dependências

- `App`: compõe rotas públicas e protegidas (`RequireAuth`).
- Páginas: leem parâmetros de rota, coordenam consultas via `useQuery` e ligam callbacks aos componentes.
- Componentes: apresentação e estado local de formulário/erros; recebem dados e callbacks por props.
- `features/auth`: login, `/auth/me` e contexto `AuthContext`.
- `features/catalog`: tipos e leitura pública de cursos, matérias, vínculos e vagas.
- `features/monitoring`: tipos, chamadas de escrita/leitura (vagas, candidaturas, monitores, horários, atividades, usuários, catálogo admin, agenda) e regras de validação local (`monitoring.rules.ts`).
- `shared/api/http.ts`: transporte HTTP, cabeçalho Bearer, `AbortSignal` e parse de erros do `GlobalExceptionHandler`.
- `shared/useQuery.ts`: estados `loading`/`success`/`error`, cancelamento e `retry()`.
- Backend: autenticação JWT, permissões (`AccessGuard`), regras de negócio e persistência.

A dependência segue de cima para baixo: `pages` -> `components`/`features` -> `shared`. Infraestrutura em `shared` não importa páginas nem componentes.

## Convenções de código

- Manter TypeScript estrito, sem `any` nem casts que escondam erro de contrato.
- Identificadores de código em inglês; textos de interface e mensagens em português.
- Usar chave composta para vínculo curso-matéria e mapas de consulta ao cruzar coleções por ID.
- Respeitar `AbortSignal` e não converter JSON inesperado em lista vazia (lançar `ApiError(502, ...)`).
- Não adicionar Redux, bibliotecas externas de cache ou classes/repositórios artificiais sem demanda real.
- Ao renomear ou apagar módulos, atualizar todos os imports sem deixar reexports antigos.

## Formulários, acessibilidade e layout

- Nos formulários com validação por campo (`ApplicationForm`, `VacancyForm`, `OfficeHoursForm`, `MonitorReviewForm`), submeter via `<form onSubmit>` com `preventDefault` e `noValidate`, exibindo mensagens no `FormField`. Na `LoginPage` e nos painéis administrativos e de gestão (`ManagementPage`, `MonitorsPanel`, `ActivityLogsPanel`, `AdminCatalogPanel`, `AdminUsersPanel`), exibir erros gerais em `<p className="notice error" role="alert">`.
- Garantir label associado (`id`, `aria-describedby`, `aria-invalid`) e avisos de erro com `role="alert"`.
- Manter navegação por teclado, foco visível, skip link e hierarquia de headings.
- Não usar `dangerouslySetInnerHTML` para dados vindos da API.
- Evitar overflow horizontal da página em mobile (390 px) e desktop; tabelas usam `.table-wrap`.

## Requisitos e rotas implementadas

| Requisito | Estado/rota |
| --- | --- |
| RF01 (catálogo e vagas) | `/courses`, `/subjects`, `/course-subjects`, `/monitoring-vacancies`, `/monitoring-vacancies/:id` |
| RF02 (horários e agenda) | `/office-hours` consulta `/horarios-atendimento`, `/agenda/eventos` e exporta `.ics` |
| RF03 (gestão de vagas) | `/management/vacancies/new` e aba Vagas em `/management` |
| RF04 (candidatura) | `/applications/new?vacancyId=ID` e aba Candidaturas em `/management` |
| RF05 (seleção e efetivação) | `/management/monitors/review` e abas Candidaturas/Monitores em `/management` |
| RF06 (horários do monitor) | `/office-hours` permite cadastro e remoção para `MONITOR` ativo, `PROFESSOR` e `ADMIN` |
| RF07 (atividades) | Aba Registros de atividades em `/management` |
| RF08 (auth e admin) | `/login` e `/admin` |

## Comandos e entrega

Na pasta `frontend/`:

```bash
npm run build
npm test
npm run lint
```

Os testes atuais mockam `fetch`; para testar integração real, subir o sistema completo com `npm run start:all` na raiz. Não incluir `node_modules/`, `dist/` ou caches em commits.
