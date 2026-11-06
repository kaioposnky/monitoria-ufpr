# Frontend — regras, decisões e continuidade

## 1. O que este documento permite fazer

Este é o registro técnico da implementação do frontend e o roteiro para modificá-lo com outro agente. Não é uma declaração de que o sistema completo está pronto.

Ordem de leitura:

1. `frontend/AGENTS.md`: convenções obrigatórias, responsabilidades, execução e verificação.
2. `frontend/README.md`: árvore de pastas e responsabilidades.
3. Este documento: regras concretas, contratos, decisões, histórico e critérios de evolução.
4. `README.md` da raiz e `especificacao_da_prof.md`: requisitos e entrega acadêmica.
5. Código atual e contratos Spring: fonte de verdade para o comportamento executável.

Para analisar as escolhas já adotadas e as pendentes do grupo, consultar [DECISOES.md](DECISOES.md), com opções, recomendações e critérios para fechar cada item. Recomendações não equivalem a requisitos aprovados.

O estado descrito foi conferido no código em 2026-11-16. Mudanças posteriores devem atualizar as seções correspondentes. Exemplos e campos de rascunho não são requisitos aprovados nem contratos de escrita.

## 2. Estado de prontidão

| Parte | Implementação atual | O que falta para funcionamento completo |
|---|---|---|
| Catálogo de cursos, matérias e vínculos | Consultas reais, tabelas e estados de consulta | Verificar com o Spring no ambiente de execução |
| Vagas e detalhes | Consultas reais, filtros locais e detalhes | Verificar integração real e confirmar políticas de candidatura |
| Candidatura | Formulário, validação, resumo e edição | Contrato, identidade/autorização, envio, persistência, consulta da candidatura e erros de negócio |
| Cadastro de vaga | Formulário baseado no catálogo e na modelagem | Contrato de criação, autorização e persistência |
| Revisão de candidatura | Preparação de decisão e observação | Consulta da candidatura, autorização, transação de decisão e regra de criação/alocação de monitor |
| Disponibilidade | Preparação de dia, período e local | Contrato de gravação, autorização e validação de conflitos |
| Consulta de horários | Aviso explícito de indisponibilidade | Endpoint e apresentação dos horários reais |
| Login e permissões | Não implementados | Decidir escopo; não confundir IDs digitados com autenticação |

Nada é enviado ou persistido pelos quatro formulários de rascunho. Sair da rota ou recarregar a página perde os dados. Voltar da revisão para edição preserva os dados enquanto o formulário permanece montado. Não há armazenamento em `localStorage` nem fallback de catálogo.

## 3. Mapa das responsabilidades para manutenção

| Mudança desejada | Arquivos principais, relativos a `frontend/src/` |
|---|---|
| Criar/alterar rota | `app/App.tsx`, página em `pages/NomePage/NomePage.tsx` |
| Alterar navegação principal | `components/Header/Header.tsx` |
| Alterar entrada e atalhos | `pages/HomePage/HomePage.tsx`, `components/NavigationCard/NavigationCard.tsx` |
| Alterar layout, foco ou título do navegador | `components/AppLayout/AppLayout.tsx` |
| Alterar estilos comuns/mobile | `styles/global.css` |
| Alterar campos e regras da candidatura | `components/ApplicationForm/ApplicationForm.tsx`, `features/monitoring/monitoring.types.ts`, `features/monitoring/monitoring.rules.ts` |
| Alterar interpretação do link de candidatura | `pages/ApplicationPage/ApplicationPage.tsx`, `app/App.tsx`, link em `components/VacancyDetails/VacancyDetails.tsx` |
| Alterar cadastro de vaga | `components/VacancyForm/VacancyForm.tsx`, `pages/NewVacancyPage/NewVacancyPage.tsx`, tipos/regras de monitoring |
| Alterar disponibilidade | `components/OfficeHoursForm/OfficeHoursForm.tsx`, `pages/OfficeHoursPage/OfficeHoursPage.tsx`, tipos/regras de monitoring |
| Alterar revisão de candidatura | `components/MonitorReviewForm/MonitorReviewForm.tsx`, `pages/MonitorReviewPage/MonitorReviewPage.tsx`, tipos/regras de monitoring |
| Alterar resumo/edição/foco de rascunhos | `components/DraftReview/DraftReview.tsx`, `features/monitoring/useDraftReview.ts` |
| Alterar acessibilidade de campos | `components/FormField/FormField.tsx` |
| Alterar carregamento/erro/nova tentativa | `shared/useQuery.ts`, `components/QueryResult/QueryResult.tsx` |
| Alterar URL, JSON ou tratamento HTTP | `shared/api/http.ts`, `features/catalog/catalog.api.ts` e `frontend/vite.config.ts` |
| Alterar contrato de catálogo | `features/catalog/catalog.types.ts`, chamadas e consumidores; conferir DTO Spring correspondente |
| Alterar filtros de vagas | `pages/VacanciesPage/VacanciesPage.tsx`, `components/VacancyFilters/VacancyFilters.tsx` |
| Alterar rótulos de situação/modalidade | `features/catalog/catalog.labels.ts` e `features/monitoring/monitoring.rules.ts`; hoje existem mapas nos dois módulos |

Não alterar somente o texto de uma opção: revisar também valores técnicos, tipos, validação, filtros, resumo e backend. As convenções de diretórios e exports estão em `AGENTS.md` e devem ser preservadas.

## 4. Contratos HTTP existentes

Fonte do backend: `backend/src/main/java/com/exemplo/demo/catalog/CatalogController.java` e DTOs da mesma pasta.

Base padrão no navegador: `/api/v1`.

| Operação | Caminho completo | Uso atual |
|---|---|---|
| Listar cursos | `GET /api/v1/courses` | Tabela de cursos e relações |
| Consultar curso | `GET /api/v1/courses/{id}` | Disponível no backend; não há página própria de detalhe de curso |
| Listar matérias | `GET /api/v1/subjects` | Tabela, vínculos, vagas e formulários dependentes do catálogo |
| Consultar matéria | `GET /api/v1/subjects/{id}` | Disponível no backend; não há página própria de detalhe de matéria |
| Listar vínculos | `GET /api/v1/course-subjects` | Tabela curso–matéria |
| Filtrar vínculos por curso | `GET /api/v1/course-subjects?courseId=ID` | Disponível no backend; frontend atual consulta todos |
| Listar vagas | `GET /api/v1/monitoring-vacancies` | Lista e preparação de candidatura |
| Consultar vaga | `GET /api/v1/monitoring-vacancies/{id}` | Detalhes |

Tipos atuais em `catalog.types.ts`:

| Tipo | Campos |
|---|---|
| `Course` | `id: number`, `code: string`, `name: string`, `sector: string ou null` |
| `Subject` | `id: number`, `code: string`, `name: string`, `department: string ou null` |
| `CourseSubject` | `courseId: number`, `subjectId: number`; sem ID único separado |
| `Vacancy` | `id`, `subjectId`, `professorId`, `positions`: números; `semester`, `type`, `status`: strings; `requirements`, `description`: string ou null |

### Transporte e estados

- `getJson` envia `Accept: application/json` e respeita o `AbortSignal` fornecido.
- HTTP 404 vira `ApiError` com mensagem de registro não encontrado. Outros status não bem-sucedidos preservam o status e geram mensagem genérica de consulta.
- JSON inválido em resposta bem-sucedida vira `ApiError(502)`.
- Listagens verificam `Array.isArray`. Não há validação completa de cada campo JSON em runtime: os tipos TypeScript não garantem o payload recebido.
- Falha de rede é apresentada por `errorMessage`; não é transformada em lista vazia.
- `useQuery` usa `loading`, `success` e `error`; cancela ao desmontar ou mudar a função de consulta; nova tentativa é manual. Não há cache, polling, prazo máximo de chamada ou retry automático configurado.
- A base pode ser alterada por `VITE_API_BASE_URL`. O proxy de desenvolvimento e a publicação estão documentados em `AGENTS.md`.

## 5. Regras implementadas na consulta de vagas

Fonte: `pages/VacanciesPage/VacanciesPage.tsx`, `VacancyFilters`, `VacancyCard` e `VacancyDetails`.

- Busca local por nome OU código da matéria, usando substring, remoção de espaços nas extremidades e comparação sem distinção de maiúsculas em `pt-BR`.
- Não há remoção de acentos: `calculo` não é garantido como equivalente a `Cálculo`.
- Modalidade e situação usam igualdade exata do valor técnico. Os filtros são combinados: texto E modalidade E situação.
- Limpar filtros restaura os três campos. A interface anuncia a contagem de resultados.
- Sem vagas no catálogo e sem correspondência aos filtros são mensagens distintas.
- O frontend busca vagas e matérias para montar os resultados; falha de consulta é erro, não resultado vazio.
- Relações por ID usam mapas de consulta. Vínculo curso–matéria tem chave composta.
- O link para preparar candidatura só aparece para situação `ABERTA`.
- O professor aparece por identificador: não há endpoint de usuário para resolver seu nome.
- A situação não é editada pela tela de detalhes.

Valores conhecidos de vaga: `ABERTA`, `EM_SELECAO`, `ENCERRADA`, `CANCELADA`. Modalidades: `REMUNERADA`, `VOLUNTARIA`. Valores externos desconhecidos não devem ser silenciosamente convertidos em um estado conhecido.

## 6. Formulários: tipos e regras exatas

Fonte: tipos e regras em `features/monitoring/`, validações locais nos quatro componentes de formulário.

Os campos de rascunho são strings para representar também o campo vazio. Não enviar esses objetos diretamente como DTO sem definir conversão, nulabilidade e contrato com o backend.

### 6.1 Candidatura — RF03

| Campo de rascunho | Regra atual |
|---|---|
| `vacancyId` | Obrigatório; deve corresponder a uma vaga recebida do catálogo com situação `ABERTA` |
| `studentId` | Obrigatório; sequência decimal de inteiro positivo; referência digitada, não identidade autenticada |
| `subjectGrade` | Opcional; se preenchido, entre 0 e 100 com até duas casas decimais |
| `cr` | Opcional; mesma regra de nota |
| `justification` | Opcional; texto livre, sem limite de comprimento explícito nesta implementação |

- O link público gerado usa `?vacancyId=ID`. A página também aceita `?vaga=ID`; se ambos estiverem presentes, `vaga` tem precedência no código atual. Esse segundo nome não foi exigido pelo usuário e não deve ser ampliado sem necessidade.
- O parâmetro deve conter inteiro positivo e caber em `Number.isSafeInteger`.
- Link inválido, vaga ausente, vaga não aberta e ausência de vagas abertas têm estados próprios.
- Quando existem outras vagas abertas, é possível limpar a escolha inválida e escolher outra.
- Mesmo vindo do link, a vaga pode ser trocada no formulário.
- O status inicial `PENDENTE` é mencionado por causa do esquema SQL, mas não existe comando de criação nem status efetivamente persistido por esta tela.
- Não há verificação real de matrícula, aprovação na disciplina, duplicidade, prazo, elegibilidade ou inscrição já existente.

### 6.2 Preparação de vaga — RF04

| Campo de rascunho | Regra atual |
|---|---|
| `subjectId` | Obrigatório; deve existir no catálogo de matérias consultado |
| `professorId` | Obrigatório; inteiro positivo digitado; existência e papel não são verificados |
| `semester` | Obrigatório; exatamente quatro dígitos, barra e `1` ou `2`; aceita espaços nas extremidades na validação; não impõe intervalo de anos |
| `positions` | Obrigatório; sequência decimal de inteiro positivo |
| `type` | Obrigatório; `REMUNERADA` ou `VOLUNTARIA` |
| `requirements` | Opcional; texto livre |
| `description` | Opcional; texto livre |

O formulário não possui campo `title` ou `createdById`. A base é o catálogo atual e a modelagem; não reintroduzir os campos incompatíveis do antigo CRUD genérico. O status inicial `ABERTA` é apenas uma referência ao esquema enquanto não existir criação real.

### 6.3 Disponibilidade — RF06 e consulta RF02

| Campo de rascunho | Regra atual |
|---|---|
| `monitorId` | Obrigatório; inteiro positivo; existência não consultada |
| `weekday` | `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA` ou `SABADO`; domingo não está previsto na modelagem atual |
| `startTime` | Obrigatório; formato `HH:mm`, entre 00:00 e 23:59 |
| `endTime` | Obrigatório; mesmo formato e estritamente posterior ao início, no mesmo dia |
| `location` | Obrigatório; texto após trim não vazio e até 150 caracteres |
| `meetingLink` | Opcional; se preenchido, URL com protocolo HTTP ou HTTPS; controle HTML limita a 255 caracteres |

- Não aceita período que atravessa meia-noite ou início igual ao fim.
- Não verifica sobreposição, capacidade, disponibilidade de sala ou carga horária do monitor.
- O limite de 255 do link está no controle HTML, não como regra completa no helper; não presumir validação de backend.
- RF02 não está implementado como consulta: a página informa que falta endpoint. Rascunho de disponibilidade não é horário cadastrado.

### 6.4 Revisão de candidatura — preparação do RF05

| Campo de rascunho | Regra atual |
|---|---|
| `applicationId` | Obrigatório; inteiro positivo; candidatura não é buscada nem validada no backend |
| `decision` | Obrigatório; `APROVADO` ou `REPROVADO` |
| `observation` | Opcional; texto livre |

Não há ranking, seleção automática, nota calculada, alteração de status, verificação de professor responsável ou criação de monitor. A relação entre aprovar candidatura e alocar monitor precisa de regra confirmada e execução transacional no backend.

### 6.5 Regras transversais dos rascunhos

- `isPositiveInteger` usa regex após trim; não impõe limite superior nem confirma existência do ID. Não presumir compatibilidade com limites de `number` ou inteiro de banco para qualquer entrada.
- `isScoreInRange` aceita ponto decimal, até duas casas, e não aceita notação exponencial ou vírgula no texto validado. A normalização do controle numérico depende do navegador; verificar a experiência em português ao alterar esse comportamento.
- Submeter chama `preventDefault`, monta erros por campo e só abre revisão sem erros.
- Editar um campo limpa o erro daquele campo; regras cruzadas são reavaliadas ao revisar novamente.
- Formulários usam `noValidate`: a validação própria é responsável pelas mensagens. Atributos HTML auxiliam entrada, mas não substituem a validação explícita.
- Não existe estado de envio, botão de confirmar persistência ou resposta de sucesso real. A revisão não equivale a submissão.
- `DraftReview` mostra texto legível, aviso de integração e botão de edição; recebe foco no título. `useDraftReview` devolve foco ao título do formulário ao editar.
- `FormField` associa label, dicas e erros ao controle via identificadores e ARIA.

## 7. Registro das alterações e decisões

Este registro descreve o trabalho realizado, não uma reconstrução integral de todos os commits do repositório.

| Alteração | Motivo | Consequência/trade-off |
|---|---|---|
| NestJS SSR substituído por Vite + React + TypeScript | Escolha explícita do usuário para simplificar entrega com Spring existente | Bundle estático; requer JS, fallback de rotas e configuração de API na hospedagem; não oferece SSR por padrão |
| React Router para navegação | Rotas explícitas e links internos | Hospedagem deve devolver `index.html` nas rotas da SPA |
| Remoção do CRUD genérico de nove entidades | Formulários anunciavam operações sem endpoints e campos divergentes | Interface ficou alinhada ao catálogo real; escritas não foram fingidas |
| Separação em `pages` e uma pasta por componente | Pedido explícito do usuário e responsabilidades claras | Mais arquivos, com navegação e manutenção localizadas |
| Componentes como `export function`, props locais | Pedido explícito do usuário | Preservar convenção nas alterações; não trocar por defaults/arrows |
| Transporte e estado assíncrono centralizados | Não espalhar fetch, erros e cancelamento | Sem introduzir biblioteca de cache ou camada de serviços vazia |
| Formulários de preparação/revisão | Pedido de frontend parcialmente preparado para integração | Permitem validar interface, mas não atendem persistência nem segurança |
| Estado local, sem localStorage de rascunhos | Evitar persistência paralela e armazenamento de dados pessoais sem requisito | Usuário perde o rascunho ao sair; aviso é obrigatório |
| FormField, QueryResult, EmptyState e DraftReview compartilhados | Centralizar comportamento repetido e acessibilidade | Mudanças nesses módulos afetam múltiplas telas; verificar os consumidores |
| README restrito à árvore e AGENTS separado | Pedido explícito do usuário | Manter arquitetura/regras detalhadas neste guia e convenções no AGENTS |

Commit conhecido da migração: `24645c5` — `Migrate frontend from NestJS SSR to React and Vite`. Não presumir que páginas posteriores, formulários ou esta documentação estejam nesse commit. Conferir o estado Git antes de criar ou continuar commits; diretórios gerados podem estar versionados no histórico.

Os princípios efetivamente aplicados e limites da classificação SOLID/GRASP estão em `AGENTS.md`. Não acrescentar padrões apenas para aumentar quantidade: a decisão deve reduzir acoplamento, concentrar responsabilidade ou isolar uma variação concreta.

## 8. Como alterar sem depender desta conversa

### Alterar um campo de formulário

1. Confirmar se é mudança de apresentação, preenchimento ou regra de negócio.
2. Alterar o tipo de rascunho em `monitoring.types.ts` se necessário.
3. Atualizar estado inicial, controle, `validate`, erro e resumo no formulário.
4. Atualizar helper somente se a regra for compartilhada; não criar abstração para um caso trivial.
5. Se já houver integração real, atualizar conversão para DTO e contrato/teste correspondente.
6. Verificar vazio, valor válido, limite inválido, revisão e edição preservada.
7. Registrar aqui a regra e atualizar `AGENTS.md` se a convenção mudou.

### Alterar situação, modalidade ou dias permitidos

1. Confirmar o valor técnico com o backend/modelagem e a política de transição.
2. Atualizar tipos, listas de opções, rótulos e validadores envolvidos.
3. Revisar filtros e links condicionais: `ABERTA` controla preparação de candidatura.
4. Conferir o tratamento de registros antigos ou valores desconhecidos.
5. Verificar tela, formulário e resumo, não só o dropdown.

### Adicionar uma página

1. Criar `pages/NomePage/NomePage.tsx` com `export function`.
2. Extrair elementos visuais com responsabilidade própria em `components/Nome/Nome.tsx`.
3. Registrar a rota em `app/App.tsx`; adicionar acesso na navegação apenas se fizer sentido.
4. Reutilizar `PageHeader`, estados de consulta e componentes de campo.
5. Incluir carregamento, vazio, erro e recurso inexistente quando aplicável.
6. Atualizar somente o mapa de pastas no README; requisitos/estado ficam aqui e no AGENTS.

### Conectar um formulário ao backend

1. Ler os endpoints existentes e acordar o contrato ausente; não usar o nome da tabela como endpoint presumido.
2. Definir identidade/autorização, campos, tipos numéricos, nulos, status, duplicidade e erros.
3. Implementar a operação Spring com persistência e regras autoritativas. Para aprovação, definir a transação e o efeito sobre monitor/vagas.
4. Criar o tipo de comando confirmado, separado do rascunho string; definir conversão explícita e validar números/valores opcionais.
5. Acrescentar transporte de escrita com tratamento HTTP/JSON apropriado, inclusive resposta sem conteúdo quando fizer parte do contrato. `getJson` atual não é cliente genérico de escrita.
6. Coordenar a submissão na página ou hook da funcionalidade; fornecer callback ao formulário. Não espalhar fetch no JSX.
7. Implementar enviando, bloqueio de duplo envio, erro preservando dados e confirmação só após resposta real.
8. Após sucesso, atualizar/consultar o estado real; definir o destino de navegação e a consulta do recurso criado.
9. Retirar `IntegrationNotice` e textos de rascunho somente do fluxo realmente conectado. Não remover avisos das outras operações pendentes.
10. Provar escrita e consulta persistidas com o backend real; registrar execução, ambiente e erros demonstrados.

## 9. Sequência mínima para finalizar a entrega funcional

Não é necessário terminar todos os CRUDs para a disciplina. A fatia recomendada é candidatura, sujeita à confirmação das regras:

1. Confirmar RF03: candidatura para seleção de monitor, não inscrição de estudante para comparecer ao atendimento.
2. Definir como representar o ator no protótipo e quais permissões são exigidas; se usar ator demonstrativo, documentar que não é login completo.
3. Implementar criação e consulta de candidatura no Spring, com unicidade estudante/vaga e validação do estado permitido da vaga.
4. Conectar `ApplicationPage`/`ApplicationForm` com estado real de submissão.
5. Demonstrar candidatura válida, consulta após criação e erro de duplicidade sem segunda candidatura.
6. Definir e implementar uma dependência externa substituível conforme a especificação acadêmica; a escolha ainda não está confirmada. Não assumir notificação ou autenticação externa como requisito aprovado.
7. Atualizar UML, ADRs e análise de evolução para refletir os nomes e dependências efetivos. Este guia não substitui essas entregas.

Depois, integrar cadastro de vaga, decisão e horários como fluxos separados, cada um com contrato, persistência e verificação. Não declarar o frontend completo enquanto as capacidades anunciadas dependerem de rascunho.

## 10. Evidência e roteiro de verificação

Verificações realizadas na implementação anterior deste guia:

- TypeScript/build, quatro testes de transporte e lint passaram.
- No navegador, foram exercitados filtros, preparação de candidatura, nota acima de 100 rejeitada, edição preservada, semestre inválido rejeitado, revisão de vaga, horário final anterior ao inicial rejeitado e revisão de decisão.
- Foi conferida a página de horários em 390 px sem overflow horizontal e com labels associados.
- O caminho de catálogo preenchido usou respostas HTTP simuladas apenas na inspeção; não houve prova de integração bem-sucedida com Spring ou persistência. O erro real de indisponibilidade do backend também foi observado.

Isso é evidência histórica, não garantia sobre alterações futuras. Comandos e ambiente estão em `AGENTS.md`.

Roteiro para o próximo agente:

| Cenário | Resultado esperado |
|---|---|
| Backend indisponível | Erro e ação de nova tentativa; nunca catálogo vazio falso |
| Catálogo vazio | Mensagem de vazio após consulta bem-sucedida |
| Busca/filtros sem resultado | Mensagem de nenhum resultado e limpar filtros |
| Link de candidatura inválido/fechado | Não abre candidatura como se a vaga estivesse aberta |
| Revisar e voltar a editar | Dados preservados e foco na etapa correta |
| Horário final igual/anterior | Revisão bloqueada com erro no campo |
| Trocar rota/recarregar rascunho | Dados perdidos conforme aviso; nenhum sucesso de gravação |
| Conteúdo com marcação HTML | Texto escapado, sem execução de script |
| Mobile/teclado | Sem conteúdo inacessível; foco, labels e ações utilizáveis |
| Escrita futura integrada | Persistência e consulta reais, conflito demonstrado e nenhuma confirmação falsa |

## 11. Pedido reutilizável para outro agente

> Continue o frontend de monitoria-ufpr. Leia `frontend/AGENTS.md`, `frontend/README.md` e `frontend/docs/CONTINUIDADE.md` antes de editar. A alteração desejada é: [descrever comportamento]. Preserve componentes como funções exportadas, uma pasta por componente e páginas em `pages`. Confirme o contrato no backend antes de integrar; não trate rascunho como persistência. Identifique os arquivos e regras afetados, implemente o caminho completo do pedido, verifique o fluxo real e atualize a documentação do que mudou. Informe separadamente o que foi exercitado com backend real, transporte simulado e o que continua pendente.
