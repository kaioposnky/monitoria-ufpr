# Instruções para agentes — frontend

## Escopo e fonte de verdade

Estas instruções se aplicam a `frontend/`. O projeto usa Vite, React, TypeScript e React Router. O Spring Boot é o único backend de negócio. Não reintroduzir NestJS SSR, Next.js, controllers de servidor ou dependências de telemetria NestJS neste frontend.

Antes de alterar um fluxo, ler os requisitos atuais no `README.md` da raiz, os arquivos envolvidos e os endpoints/DTOs realmente implementados no backend. Requisitos em rascunho, tabelas SQL e telas existentes não comprovam funcionalidades de API. Não inventar contratos ou transformar propostas em requisitos confirmados.

O `frontend/README.md` contém somente a organização de pastas e suas responsabilidades. Manter convenções e instruções operacionais neste arquivo. Consultar [docs/CONTINUIDADE.md](docs/CONTINUIDADE.md) para regras exatas dos campos, contratos, histórico de decisões, limites conhecidos e roteiros para alterar ou integrar os fluxos. Atualizar cada assunto no documento correspondente, sem duplicar regras.

Consultar também [docs/DECISOES.md](docs/DECISOES.md) antes de alterar regras de negócio: concentra decisões adotadas e questões pendentes para análise do grupo. Não tratar recomendações desse registro como aprovação.

## Organização obrigatória

- Rotas são compostas em `src/app/App.tsx`; inicialização em `src/main.tsx`.
- Cada página fica em `src/pages/NomePage/NomePage.tsx`.
- Cada componente fica em `src/components/Nome/Nome.tsx`.
- Componentes e páginas usam PascalCase e declaração nomeada `export function Nome(...)`. Não usar `export default`, arrow function exportada ou `React.FC` para componentes.
- Declarar os tipos de props e tipos exclusivos do componente no próprio `.tsx`. Não criar um arquivo de tipos para cada componente.
- Tipos compartilhados do assunto ficam em `src/features/assunto/assunto.types.ts`; contratos da API não devem ser duplicados em cada página.
- Consultas do assunto ficam em `*.api.ts`; regras de preenchimento e formatação em arquivos do assunto, como `monitoring.rules.ts`.
- Hooks usam prefixo `use`. Hooks específicos ficam na funcionalidade; os transversais, em `shared`.
- Componentes visuais ficam em `components`, não em `shared/components`.
- Usar imports diretos dos arquivos. Não adicionar barrels `index.ts`, reexports ou aliases de compatibilidade.
- CSS comum permanece em `src/styles/global.css`. Reutilizar classes existentes; não introduzir framework de estilos ou CSS inline sem necessidade.
- Testes ficam próximos ao módulo, com sufixo `.spec.ts`, conforme configuração do Vitest.

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

- `App`: composição das rotas, sem regras de negócio ou consultas.
- Páginas: leitura dos parâmetros de rota, coordenação das consultas e composição dos componentes.
- Componentes: apresentação e interação; recebem dados/callbacks por props. Formulários podem manter estado local de preenchimento, erros e revisão.
- `features/catalog`: tipos alinhados aos DTOs, chamadas à API e rótulos do catálogo.
- `features/monitoring`: tipos de rascunho, validação de preenchimento e transição edição/revisão. Esses tipos ainda não são contratos HTTP de escrita confirmados.
- `shared/api/http.ts`: configuração e transporte HTTP, leitura JSON e erros de resposta. Não espalhar `fetch` em páginas ou componentes.
- `shared/useQuery.ts`: carregamento, sucesso, erro, nova tentativa manual e cancelamento ao desmontar ou trocar a consulta.
- Backend: identidade do ator, autorização, elegibilidade, transições de negócio, integridade e persistência. Validação no navegador não substitui essas garantias.

A dependência segue a composição: páginas usam componentes e funcionalidades; funcionalidades usam o transporte compartilhado. Infraestrutura compartilhada não importa páginas ou componentes específicos. Preferir composição a herança e estado local a estado global sem necessidade demonstrada.

## Princípios e padrões aplicados

| Princípio/padrão | Aplicação neste frontend |
|---|---|
| Responsabilidade única (SOLID/SRP) | Rotas, coordenação de tela, apresentação, regras de preenchimento e transporte têm motivos de mudança separados. |
| Alta coesão (GRASP) | Arquivos de uma funcionalidade concentram contratos e comportamento relacionados ao mesmo assunto. |
| Baixo acoplamento (GRASP) | Componentes recebem props; detalhes de HTTP não são repetidos nas telas. |
| Information Expert (GRASP) | Transporte interpreta HTTP; componentes apresentam dados; regras de preenchimento validam formato; backend decide regras acadêmicas. |
| Indirection / Pure Fabrication (GRASP) | Módulos de HTTP e hooks coordenam aspectos técnicos sem serem entidades acadêmicas. |
| Protected Variations (GRASP) | Chamadas e tipos do catálogo concentram o contato com o contrato externo, limitando a propagação de mudanças. |
| Composição de componentes | Layout, campos, estados de consulta, filtros e formulários são combinados sem hierarquias de herança. |
| Fluxo unidirecional de dados | Props levam dados aos filhos; callbacks comunicam interações; o dono do estado aplica a alteração. |
| Hooks customizados | `useQuery` coordena consultas; `useDraftReview` coordena edição/revisão e foco. |
| Estados explícitos | Consulta distingue carregamento, sucesso e erro; sucesso vazio não é falha de rede. Rascunho distingue edição e revisão. |
| Integração encapsulada | `catalog.api.ts` concentra endpoints existentes e usa o transporte compartilhado. |

Não afirmar aplicação de todo SOLID ou de todos os padrões GRASP apenas por usar React/TypeScript. OCP, LSP, ISP e DIP exigem análise dos contratos e pontos de variação reais; não há uma implementação explícita de cada um só por separar arquivos. Não chamar esta organização de MVC clássico, Clean Architecture ou Hexagonal completa.

Não adicionar classes, interfaces para cada função, Repository no frontend, serviços de simples repasse, factories, event bus, Redux ou contêiner de injeção apenas para demonstrar padrões. Extrair um módulo quando ele concentrar responsabilidade real, reduzir repetição significativa ou isolar uma variação concreta.

## Convenções de implementação

- Manter TypeScript estrito; evitar `any`, casts que escondem erros e contratos genéricos de CRUD sem suporte na API.
- Usar identificadores em inglês e interface/mensagens em português, seguindo os arquivos existentes.
- Usar chaves estáveis em listas. Vínculo curso–matéria usa a chave composta, não um `id` inventado.
- Para relacionamentos de catálogo, preferir mapas de consulta a buscas repetidas ao renderizar coleções.
- Carregar consultas independentes em paralelo quando apropriado e não ocultar suas falhas.
- Manter a função de carregamento estável ao usar `useQuery`; usar função de módulo ou `useCallback` quando depender de parâmetros.
- Respeitar `AbortSignal` e não atualizar estado de consultas canceladas.
- Não converter resposta inválida em array vazio. Apresentar quebra de contrato como erro.
- Não introduzir retries automáticos, cache ou estado global sem requisito. A nova tentativa atual é uma ação explícita do usuário.
- Ao substituir um módulo, atualizar todos os imports e remover o caminho antigo; não manter shims ou reexports obsoletos.

## Formulários, acessibilidade e responsividade

- Usar `<form onSubmit>` com `preventDefault`; não implementar submissão somente no `onClick` do botão.
- Usar tipos HTML apropriados, `required`, limites e validação explícita para regras de preenchimento. Os formulários atuais usam `noValidate` para apresentar mensagens próprias e devem cobrir as restrições relevantes.
- Cada controle tem label associado. Usar `FormField` para ligar `id`, `aria-describedby`, dicas, erros e `aria-invalid`.
- Erros ficam próximos ao campo; não depender apenas de cor. Avisos de erro de consulta usam `role="alert"`; carregamento e contagem usam estado acessível quando necessário.
- Preservar dados ao alternar entre revisão e edição. Usar resumo legível, não JSON bruto.
- Manter foco no título apropriado ao trocar página ou etapa. Preservar skip link, landmarks semânticos, hierarquia de títulos e indicação da rota ativa.
- Garantir navegação por teclado, foco visível e controles com área de interação adequada; não remover indicadores de foco.
- Renderizar conteúdo externo como texto React. Não usar `dangerouslySetInnerHTML` para dados de usuários/API.
- Layout deve funcionar em desktop e mobile, com controles de largura fluida e sem overflow horizontal da página. Tabelas podem ter rolagem restrita ao seu contêiner.
- Não adicionar animações, fontes externas ou dependências visuais só para ornamentação. Preservar a identidade azul e a interface acadêmica simples.

## Requisitos e estado da integração

| Requisito | Estado/rota |
|---|---|
| RF01 — consultar monitorias por disciplina | `/monitoring-vacancies`, filtros locais por disciplina/código, modalidade e situação; detalhes em `/monitoring-vacancies/:id`. |
| RF02 — consultar horários | `/office-hours` identifica a consulta como indisponível porque falta endpoint; não apresenta agenda simulada ou vazio enganoso. |
| RF03 — candidatura | `/applications/new?vacancyId=ID` permite preencher e revisar rascunho para vaga aberta real. |
| RF04 — cadastrar monitoria | `/management/vacancies/new` prepara rascunho da vaga com matéria do catálogo. |
| RF05 — validar monitor | `/management/monitors/review` prepara decisão sobre candidatura; não aprova nem cria monitor. O fluxo definitivo precisa de contrato e regra de negócio confirmados. |
| RF06 — disponibilidade | `/office-hours` prepara dia, horários, local e link; valida fim posterior ao início. |

Consultas disponíveis no backend atual:

- `GET /api/v1/courses` e `/courses/{id}`;
- `GET /api/v1/subjects` e `/subjects/{id}`;
- `GET /api/v1/course-subjects`, com filtro opcional `courseId`;
- `GET /api/v1/monitoring-vacancies` e `/monitoring-vacancies/{id}`.

Os caminhos após `e` acima também usam o prefixo `/api/v1`. Conferir o controller atual antes de mudar a integração.

Regras enquanto não houver escrita implementada:

- Não criar POST/PUT/PATCH/DELETE para caminhos presumidos.
- Não simular sucesso, persistência, listagens de candidaturas, autorização ou aprovação.
- Rascunhos vivem somente no estado da tela; não usar `localStorage` para dados pessoais ou como substituto do backend.
- Mostrar `IntegrationNotice` antes do preenchimento e no resumo: nada é enviado/salvo e o rascunho é perdido ao sair.
- Nota/CR entre 0 e 100, semestre AAAA/1 ou AAAA/2, quantidade positiva e ordem dos horários são validações de preparação atuais, não uma especificação final de elegibilidade.
- IDs de aluno, professor ou monitor são referências de preenchimento, não autenticação. A área de gestão é navegação, não uma barreira de segurança.
- Antes de integrar: confirmar DTOs, identidade, permissões, campos obrigatórios, erros, conflitos e transições; então conectar a funcionalidade e mostrar confirmação somente após resposta real bem-sucedida.
- Não marcar a fatia vertical acadêmica como pronta com base apenas nos rascunhos.

## Execução e configuração

Na pasta `frontend/`:

```bash
npm install
npm run dev
```

Frontend padrão em `http://localhost:5173`; backend Spring esperado em `http://localhost:8080`. Na raiz, `npm run start:all` inicia ambos, após instalar dependências da raiz e do frontend. O backend requer o ambiente Java adequado.

O proxy de desenvolvimento encaminha `/api` ao Spring. Para mudar o destino, definir `BACKEND_PROXY_TARGET=http://localhost:8081` em `frontend/.env.local` e reiniciar o Vite.

```bash
npm run build
npm run preview
```

O build verifica tipos e gera `dist/`. `preview` é somente para inspeção local e não possui o proxy de desenvolvimento. Em produção, servir `dist/`, encaminhar `/api` ao Spring antes do fallback e redirecionar as rotas da SPA para `index.html`. A aplicação está configurada para a raiz do domínio.

Se necessário, definir `VITE_API_BASE_URL` antes do build para outra origem e configurar CORS no backend. Tudo que usa `VITE_*` fica público no bundle; nunca colocar segredos nessas variáveis.

## Verificação e entrega

- Para alterações de código, executar os checks proporcionais ao escopo:

```bash
npm run build
npm test
npm run lint
```

- Usar `npm run format` somente nos arquivos do escopo; não restilizar alterações alheias. Para arquivos específicos, chamar Prettier explicitamente.
- Para interface, abrir o fluxo no navegador e verificar caminho válido, erro relevante, revisão/edição e responsividade. Referências úteis: desktop 1365 px e mobile 390 px.
- Testes permanentes devem cobrir comportamento, limites e erros reais, não texto decorativo, estrutura de arquivos ou mocks que apenas repetem argumentos.
- Os testes existentes de transporte simulam `fetch`; não provam execução do Spring nem persistência.
- Dados simulados usados em inspeção devem ficar apenas no ambiente de verificação, nunca como fallback na aplicação. Informar o que foi verificado com backend real e o que foi simulado.
- Não editar backend, dependências, requisitos ou contratos fora do pedido sem justificar a necessidade. Não fazer commit/push sem solicitação.
- `node_modules/`, `dist/` e caches são gerados; não incluí-los em commits. Dependências já versionadas no histórico não autorizam adicionar mudanças locais desses diretórios a uma tarefa de frontend.
- Atualizar o mapa de pastas no README quando a organização mudar e estas instruções quando as convenções ou capacidades reais mudarem. Documentação apenas não exige build ou testes de código.
