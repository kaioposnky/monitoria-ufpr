# Sistema de Monitoria

Projeto da disciplina de Design e Arquitetura de Software: um sistema web para organizar as monitorias do Setor de Ciências Exatas da UFPR. O sistema completo está em planejamento; as funcionalidades disponíveis estão descritas em "Estado do protótipo".

## Contexto, escopo e stakeholders

O sistema reúne as informações de monitoria que os alunos precisam no dia a dia: disciplina, monitor, horário e local de atendimento. Os monitores publicam seus horários e os professores organizam as monitorias, abrem vagas e selecionam os alunos que vão atuar como monitores. O acesso é pelo navegador, tanto no computador quanto no celular.

Para este trabalho, consideramos cerca de 100 monitorias e 3.000 participações por semestre no Setor de Ciências Exatas. Como um aluno pode participar de mais de uma monitoria, esse total não corresponde necessariamente a 3.000 pessoas. No dimensionamento, adotamos um cenário mais exigente, com até 3.000 alunos e concentração de consultas nos dias anteriores às provas. Esses números são premissas do projeto acadêmico, sem levantamento de campo ou medição de tráfego da UFPR.

### Atores e interesses

| Ator ou stakeholder | Responsabilidades e interesses |
| --- | --- |
| Aluno | Consultar monitorias, monitores, horários e locais; consultar vagas e acompanhar suas próprias candidaturas para atuar como monitor. |
| Monitor | Publicar e atualizar horários e locais de atendimento das monitorias às quais está vinculado; manter informações de atendimento acessíveis aos alunos. Também pode exercer as ações de aluno. |
| Professor responsável | Criar e manter suas monitorias, gerenciar vagas, avaliar candidaturas e designar monitores para disciplinas sob sua responsabilidade. |
| Setor de Ciências Exatas / coordenações | Acompanhar a organização e a divulgação da oferta de monitorias. O escopo não inclui um perfil administrativo próprio para esses setores. |
| Equipe de desenvolvimento | Desenvolver e manter o sistema com uma estrutura que uma equipe pequena consiga entender e operar. |

Para receber atendimento, o aluno consulta os horários e comparece ao local. Não há agendamento ou reserva. Já a candidatura a uma vaga é destinada ao aluno que quer trabalhar como monitor.

## Requisitos

O escopo está dividido em gestão de monitorias, horários e vagas. Os requisitos incluem funcionalidades ainda não implementadas.

### Requisitos funcionais

| ID | Requisito | Responsável e comportamento esperado |
| --- | --- | --- |
| RF01 | Gerenciar monitorias | Professor cria, consulta, atualiza e encerra monitorias sob sua responsabilidade, associadas a disciplinas. |
| RF02 | Gerenciar designações de monitores | Professor vincula e desvincula monitores às monitorias de suas disciplinas; a designação determina quais monitorias cada monitor pode gerenciar. |
| RF03 | Consultar monitorias e monitores | Aluno consulta monitorias por disciplina e visualiza os respectivos monitores responsáveis pelo atendimento. |
| RF04 | Gerenciar horários e locais | Monitor cadastra, consulta, altera e remove horários e locais de atendimento apenas das monitorias às quais está vinculado; professor responsável também pode gerenciá-los. |
| RF05 | Consultar horários e locais | Aluno visualiza os horários publicados e os locais de atendimento, inclusive pelo celular, sem precisar reservar um horário. |
| RF06 | Gerenciar vagas de monitoria | Professor cria, consulta, atualiza e exclui vagas para atuar como monitor em suas monitorias; aluno consulta as vagas ofertadas. |
| RF07 | Gerenciar candidaturas próprias | Aluno registra, consulta e cancela sua candidatura a uma vaga de monitoria. |
| RF08 | Selecionar candidatos | Professor consulta e avalia candidaturas de suas vagas e registra o resultado da seleção; aluno consulta o resultado de sua própria candidatura. A vinculação do selecionado à monitoria é tratada pelo RF02. |

### Restrições e requisitos de qualidade

| ID | Requisito | Critério ou orientação de verificação |
| --- | --- | --- |
| RQ01 | Responsividade e acesso web | Consultas e operações autorizadas devem permanecer acessíveis em desktop e mobile, sem conteúdo cortado nem ações inacessíveis. Demonstrar os fluxos em larguras de referência de 360 px e 1280 px, verificando também a adaptação entre elas. |
| RQ02 | Segurança por papel e vínculo | Distinguir aluno, monitor e professor. O backend deve negar operações sem permissão: aluno altera somente suas candidaturas; monitor altera horários somente de suas monitorias; professor gerencia somente monitorias, vagas, candidaturas recebidas e designações sob sua responsabilidade. Ocultar botões não substitui autorização no backend. Verificar tentativas com papel incorreto e acesso a recursos de terceiros. |
| RQ03 | Desempenho de consultas | Atender ao cenário estimado de 100 requisições GET/s de alunos consultando monitorias, monitores e horários nas semanas de provas. Verificar com teste de carga, registrando a distribuição das consultas, a duração, a latência e os erros. A capacidade ainda precisa ser medida; o limite aceitável de latência está em aberto. |
| RQ04 | Simplicidade | Usar um único backend Spring Boot, monolítico e organizado em camadas, com responsabilidades claras para apresentação, controle e domínio. A equipe deve conseguir localizar regras, testar e executar o projeto sem precisar operar serviços distribuídos. |
| RQ05 | Comunicação explícita | Frontend e backend trocam HTTP/JSON por uma API documentada com OpenAPI/Swagger, com contratos e respostas de erro compreensíveis. |
| RQ06 | Modificabilidade, testabilidade e disponibilidade | Separar apresentação, regras e persistência para facilitar alterações e testar regras e permissões sem depender da interface. Mostrar falhas de consulta ao usuário, em vez de exibir uma lista vazia. O projeto não prevê redundância nem uma meta numérica de disponibilidade. |

### ASRs selecionados e dimensionamento

Escolhemos três requisitos arquiteturalmente significativos: desempenho (RQ03), segurança (RQ02) e simplicidade (RQ04). Eles orientam os ADRs a seguir. Modificabilidade, testabilidade e disponibilidade também entram na avaliação das decisões, como requisitos complementares.

A estimativa de 100 GET/s considera 3.000 alunos fazendo duas requisições cada em um intervalo de 60 segundos: 3.000 × 2 / 60 = 100 GET/s. É um cenário de estresse assumido pelo grupo, ainda sem validação por teste. O valor representa a média nesse minuto; picos menores que um minuto podem ser maiores. Os slides devem detalhar o cálculo e discutir a concentração de acessos adotada, diferenciando número de alunos de participações em monitorias.

## Decisões arquiteturais (ADRs)

As decisões se aplicam ao sistema proposto. O status de cada ADR indica o que já existe e o que ainda precisa ser implementado ou validado.

### ADR 001: backend monolítico em camadas e frontend separado

- Status: adotada para a proposta.
- Contexto e forças: o escopo e o tamanho da equipe favorecem uma solução simples (RQ04), que permita alterar e testar partes do sistema separadamente (RQ06).
- Alternativas: monólito em camadas, serviços de negócio separados ou microsserviços com implantação e dados distribuídos.
- Decisão: manter um backend Spring Boot com controllers, serviços de aplicação/domínio e repositórios. O frontend React cuida da apresentação. As regras de negócio ficam no backend, sem servidores adicionais para essa função.
- Relação com MVC: podemos associar a apresentação em React à View, os controllers HTTP ao Controller e o domínio, as regras e o acesso aos dados ao Model. O Model inclui mais que o banco. Como o React mantém estado e lógica de interface e recebe JSON da API, essa organização difere do MVC clássico, em que o Spring renderiza as views. A arquitetura é cliente-servidor, com backend monolítico em camadas e frontend separado.
- Consequências positivas: menos infraestrutura para executar e depurar, regras centralizadas e testes separados por responsabilidade.
- Custos e riscos: o backend precisa ser implantado e escalado como uma unidade. A equipe deve cuidar das dependências entre camadas e manter os contratos usados pelo frontend.

### ADR 002: PostgreSQL e persistência relacional

- Status: adotada. O perfil padrão usa PostgreSQL; desenvolvimento e testes usam H2 conforme a configuração existente.
- Contexto e forças: disciplinas, monitorias, usuários, vagas e candidaturas têm relações que precisam permanecer consistentes. A escolha também considera simplicidade (RQ04) e testes de persistência (RQ06).
- Alternativas: PostgreSQL compartilhado pelo monólito, banco documental ou bancos separados por serviço.
- Decisão: usar PostgreSQL, repositórios JPA e migrações Flyway. H2 facilita a execução local; comportamentos específicos do PostgreSQL precisam ser verificados no próprio PostgreSQL.
- Consequências positivas: suporte a transações e restrições relacionais, integração com Spring e apenas um banco para administrar.
- Custos e riscos: uma falha no banco afeta a aplicação, e mudanças de schema exigem migrações. Mesmo com JPA, trocar o SGBD pode exigir ajustes em tipos, SQL, migrações e testes.

### ADR 003: cache para consultas de monitorias e horários

- Status: estratégia escolhida para a proposta. A política de cache e a capacidade de atendimento ainda precisam ser verificadas.
- Contexto e forças: o cenário de desempenho (RQ03) prevê 100 GET/s de alunos nas semanas de provas, com muitas consultas às mesmas monitorias e horários.
- Alternativas: acessar o banco em toda consulta, usar cache no backend ou usar cache HTTP na borda para respostas públicas.
- Decisão: priorizar cache no backend para consultas compartilháveis de monitorias, monitores e horários. PostgreSQL continua sendo a fonte dos dados. Ao alterar uma monitoria, designação ou horário, o sistema deve invalidar as entradas afetadas. Candidaturas, resultados individuais e dados privados ficam fora do cache compartilhado. A escolha da ferramenta de cache permanece em aberto.
- Consequências positivas: menos leituras repetidas no banco e possibilidade de atender à concentração de consultas mantendo o monólito.
- Custos e riscos: dados podem ficar desatualizados se a invalidação falhar. Com cache vazio ou indisponível, as consultas voltam ao banco. O teste de carga deve cobrir cache frio e aquecido para avaliar se a estratégia atende ao cenário e quanto ela melhora o desempenho.

### ADR 004: autorização por papel e vínculo com a monitoria

- Status: adotada para a proposta, ainda não implementada no protótipo.
- Contexto e forças: a segurança (RQ02) exige impedir que um usuário altere recursos de outra pessoa, mesmo conhecendo seus identificadores.
- Alternativas: restringir apenas a interface, verificar apenas o papel do usuário ou verificar papel e vínculo no backend.
- Decisão: verificar a identidade, o papel e o vínculo com o recurso em cada operação protegida no backend. A interface mostra as ações permitidas para facilitar o uso. O mecanismo de autenticação ainda será detalhado; o projeto não pressupõe login institucional.
- Consequências positivas: as permissões também se aplicam a chamadas diretas à API e podem ser testadas por papel e por recurso.
- Custos e riscos: todas as operações de escrita e consultas privadas precisam verificar as permissões com base em uma identidade autenticada. HTTPS protege o transporte dos dados; o controle de acesso continua sendo responsabilidade da aplicação.

## Tecnologias

- Backend: Java e Spring Boot, com Maven para build e dependências e Flyway para migrações.
- Frontend: Vite, React, TypeScript e React Router; npm, ESM e Vitest.
- Persistência: PostgreSQL e H2 nos perfis de desenvolvimento e teste existentes.
- API: OpenAPI e Swagger UI para documentação e chamadas manuais. Os testes automatizados de regras, integração e autorização são feitos separadamente.
- Testes: infraestrutura do Spring Boot no backend e Vitest no frontend.
- Diagramas: Mermaid para os diagramas suportados e Excalidraw para edição visual complementar. Os modelos devem acompanhar os requisitos e o código.
- Infraestrutura opcional: Cloudflare para proxy, HTTPS e métricas de tráfego HTTP se houver publicação com domínio. A execução local independe dele.

## Executar backend e frontend

Na raiz do repositório, instale as dependências do frontend e do comando
unificado uma vez:

```bash
npm install
npm --prefix frontend install
```

Depois, inicie os dois serviços em paralelo:

```bash
npm run start:all
```

O backend Spring Boot fica disponível na porta `8080` e o frontend Vite em
`http://localhost:5173`. As consultas usam `/api/v1`; o proxy de desenvolvimento
encaminha `/api` para `http://localhost:8080`. Para outro backend, configure
`BACKEND_PROXY_TARGET` em `frontend/.env.local`. Veja [frontend/AGENTS.md](frontend/AGENTS.md)
para build, publicação estática e configuração de produção.

O comando `npm run start:all` usa o perfil `dev`, que inicializa o backend com
H2 em memória, aplica as migrações Flyway e carrega os dados fictícios sem
depender de PostgreSQL, senha ou Redis locais. Para iniciar apenas o backend:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Confirme a inicialização em `http://localhost:8080/actuator/health`.

### Configurar o PostgreSQL local

O perfil padrão do backend continua usando PostgreSQL em `localhost:5432`, no
banco `monitoria_ufpr`, com o usuário `postgres`. A senha não é armazenada no
repositório: defina `SPRING_DATASOURCE_PASSWORD` no ambiente antes de iniciar a
aplicação. As variáveis `SPRING_DATASOURCE_URL` e
`SPRING_DATASOURCE_USERNAME` também podem ser usadas para uma instalação
diferente. O arquivo `.env.example` lista todas as variáveis relevantes, mas
não é carregado automaticamente pelo Spring Boot; use-o como modelo local e
nunca o preencha com uma senha real para versioná-lo.

Para usar PostgreSQL explicitamente, não ative o perfil `dev` e forneça as
credenciais por variáveis de ambiente conforme os exemplos abaixo.

Exemplo usando um usuário dedicado local (recomendado):

```bash
sudo -u postgres psql
```

```sql
CREATE USER monitoria_app WITH PASSWORD 'escolha-uma-senha-local';
CREATE DATABASE monitoria_ufpr OWNER monitoria_app;
\q
```

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/monitoria_ufpr'
export SPRING_DATASOURCE_USERNAME='monitoria_app'
export SPRING_DATASOURCE_PASSWORD='escolha-uma-senha-local'
cd backend && ./mvnw spring-boot:run
```

Alternativamente, depois de criar uma cópia local de `.env.example` chamada
`.env` e preencher os valores nela, carregue-a no shell antes de iniciar:

```bash
set -a
source .env
set +a
npm run start:all
```

Se o banco ou o usuário já existirem, não execute os comandos `CREATE`
novamente: confirme os valores com `\du` e `\l` no `psql` e ajuste apenas as
variáveis de ambiente. Um erro `password authentication failed` indica
credenciais incorretas para o usuário configurado; corrija a senha no
PostgreSQL ou no ambiente, sem desabilitar a autenticação. O schema é criado
pelas migrações Flyway na primeira inicialização.

Os testes não dependem de PostgreSQL: `backend/src/test/resources/application.properties`
continua usando H2 em memória e desativa o Flyway e o Redis.

## Organização da apresentação

O frontend usa Vite, React e TypeScript. Na migração do NestJS SSR, mantivemos o
Spring como único backend, responsável pelas regras de negócio e pela persistência.
A equipe tem menos um servidor para manter. SEO e renderização no servidor não
são requisitos confirmados do projeto.

`app` compõe as rotas; `pages` separa cada página em sua pasta; `components` mantém
um componente por pasta com funções exportadas e props no próprio TSX.
`features/catalog` concentra contratos e chamadas; `shared/api` centraliza HTTP;
`shared/useQuery` coordena carregamento, erro e cancelamento. Cada parte concentra
uma responsabilidade, seguindo SRP e evitando serviços que apenas repassam chamadas.

Essa escolha exige JavaScript no navegador e configuração da hospedagem para
encaminhar as rotas da SPA a `index.html`. A SPA não oferece SSR ou SEO por padrão.
Next.js e NestJS SSR acrescentariam um runtime de servidor sem atender a uma
necessidade atual do projeto, por isso foram descartados na migração.

## Por que não arquitetura orientada a serviços?

Consideramos aqui serviços de negócio com execução própria e comunicação pela rede. Para o escopo atual, isso exigiria manter contratos remotos e lidar com falhas de comunicação, além de operar vários serviços. Preferimos separar as responsabilidades dentro do monólito, que demanda menos infraestrutura da equipe (ADR 001).

## Por que não microsserviços?

A equipe não precisa implantar cada domínio de forma independente nem dividir o trabalho entre equipes autônomas. Microsserviços exigiriam configuração e observabilidade distribuídas, além de cuidados com a consistência entre serviços. Para avaliar o pico de consultas, vamos primeiro medir o monólito e o efeito do cache (ADRs 001 e 003).

## Comunicação

O navegador consulta a API REST Spring por HTTP/JSON. Em desenvolvimento, o proxy
do Vite mantém as chamadas na mesma origem. Em produção, publicar os arquivos
estáticos de `frontend/dist` e encaminhar `/api` ao Spring. O proxy do Vite não
faz parte do bundle. Contratos TypeScript ficam em `features/catalog/catalog.types.ts`.

Se houver publicação, podemos usar Cloudflare para proxy HTTP, HTTPS e métricas de tráfego, conforme a configuração e o plano. As métricas HTTP dependem de o tráfego passar pelo proxy; configurar apenas o DNS não basta, como explica a [documentação de proxy da Cloudflare](https://developers.cloudflare.com/dns/proxy-status/). Latência interna, banco e erros do backend precisam ser observados na aplicação. Por enquanto, não prevemos outra plataforma de observabilidade para o protótipo.

## Benefícios e limitações da arquitetura

O monólito simplifica a implantação e a depuração. Em contrapartida, uma falha pode afetar todo o backend, e sua escala é feita em conjunto. As camadas ajudam a alterar e testar o código, desde que as regras permaneçam nos lugares definidos, sem se espalhar pelos controllers e pela interface.

PostgreSQL mantém as relações consistentes, mas exige administrar schema e migrações. O cache reduz trabalho repetido e traz o risco de exibir horários desatualizados. Já a autorização precisa ser aplicada e testada em cada caminho protegido. A capacidade de atender ao pico e a disponibilidade ainda precisam de medição.

## Abstração de componentes

Pendente: descrever os módulos, suas responsabilidades e interfaces, incluindo quais dependências permitem substituir a persistência ou uma integração sem alterar o restante do sistema.

## Diagramas

- [ ] Diagrama de classes.
- [ ] Diagrama de sequência.
- [ ] Diagrama de comunicação.
- [ ] Diagrama de componentes ou pacotes.

## Estado do protótipo

O frontend oferece consultas reais de cursos, matérias, vínculos e vagas, incluindo
filtros e detalhes. Carregamento, lista vazia e falhas são estados distintos.
As páginas de candidatura, preparação de vaga, revisão pelo responsável e
disponibilidade permitem preencher, validar e revisar rascunhos, sem envio ou
persistência. A consulta de horários ainda depende de endpoint e é indicada como
indisponível. Veja o mapa de requisitos e limites em [frontend/docs/CONTINUIDADE.md](frontend/docs/CONTINUIDADE.md)
e as decisões para análise do grupo em [frontend/docs/DECISOES.md](frontend/docs/DECISOES.md).

Para completar a fatia vertical exigida pela disciplina, ainda falta demonstrar
uma operação de escrita persistida, acompanhada de consulta, um erro relevante e
uma dependência externa substituível. Os rascunhos da interface ainda não executam
candidatura persistida, aprovação, autenticação ou autorização.

## Evolução

Pendente: escolher pelo menos duas mudanças possíveis e analisar quais partes do sistema seriam alteradas e quais poderiam ser mantidas.


## Escolhas
- Backend monolítico em camadas e frontend React separado.
- API HTTP/JSON com contratos explícitos entre frontend e backend.
- PostgreSQL, JPA e migrações Flyway.
- OpenAPI/Swagger para documentar a API e fazer chamadas manuais, junto dos testes automatizados.
- Cache de consultas e autorização por papel e vínculo previstos para o sistema, ainda sem demonstração no protótipo.

Endereços da documentação da API:
- Swagger UI: `http://localhost:8080/swagger-ui.html`

- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Backend REST

O catálogo está no módulo `catalog`, com controller, serviço, repositórios JPA,
entidades e DTOs. O perfil padrão usa PostgreSQL e o perfil `dev` usa H2.
O Flyway gerencia as migrações.

Endpoints implementados, todos de leitura:

- `GET /api/v1/courses` e `GET /api/v1/courses/{id}`;
- `GET /api/v1/subjects` e `GET /api/v1/subjects/{id}`;
- `GET /api/v1/course-subjects`, com filtro opcional `courseId`;
- `GET /api/v1/monitoring-vacancies` e `GET /api/v1/monitoring-vacancies/{id}`.

O controller atual só oferece leitura. As tabelas de usuários, candidaturas,
monitores, horários e atividades já existem, mas ainda não têm endpoints correspondentes.
