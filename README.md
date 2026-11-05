# Sistema de Monitoria

Projeto acadêmico de Design e Arquitetura de Software para propor uma solução de gerenciamento de monitorias acadêmicas. Este repositório será preenchido pelo grupo ao longo do trabalho; os itens abaixo são um rascunho inicial, não uma especificação final.

## Escopo 
Exatas UFPR

## Premissas iniciais — propostas pelo grupo, ainda a validar

- Volume estimado: aproximadamente **100 monitorias por semestre**.
- Estimativa de ocupação: **30 alunos por monitoria/sala**, cerca de 3.000 participações no semestre. A transcrição também menciona “3.000 simultâneos”, mas isso precisa ser esclarecido: usuários simultâneos e requisições por segundo são métricas diferentes.
- Meta de desempenho mencionada: até **50 requisições por segundo**. Confirmar se é requisito, pico esperado ou apenas estimativa, e definir como será verificada.
- Backend: monólito Spring Boot organizado em camadas e exposto por API REST.
- Frontend separado: SPA com **Vite + React + TypeScript**, organizada por funcionalidade. A apresentação usa componentes, não MVC clássico.
- A interface deve seguir a identidade visual/design da UFPR; o grupo não busca uma interface visual sofisticada. Detalhar os critérios visuais depois.
- A solução deve ser simples e rápida de implementar por uma equipe pequena, evitando complexidade sem justificativa.

## Requisitos

> Rascunho baseado nas instruções recebidas. Confirmar ambiguidades, priorizar e transformar os requisitos em critérios de aceitação verificáveis. A entrega pede entre 6 e 10 requisitos funcionais.

### Contexto e atores

- **Contexto:** apoiar a organização e o acesso a monitorias acadêmicas, incluindo disciplinas como matemática, escrita e cálculo (exemplos citados no áudio; confirmar).
- **Atores mencionados ou inferidos da conversa:** estudante, monitor e professor responsável. Validar os papéis e responsabilidades com o grupo.

### Requisitos funcionais — rascunho

- [ ] **RF01 — Consultar monitorias:** permitir que estudantes encontrem monitorias por disciplina/matéria.
- [ ] **RF02 — Consultar horários:** apresentar dias e horários de atendimento e a disponibilidade informada para cada monitoria.
- [ ] **RF03 — Candidatar-se/participar:** definir e oferecer o fluxo para o estudante solicitar ou acessar uma monitoria. A transcrição não deixa claro se o aluno se inscreve previamente ou apenas comparece; confirmar.
- [ ] **RF04 — Cadastrar monitoria:** permitir o cadastro das informações necessárias da monitoria, como matéria, monitor e horários; definir quem pode cadastrar.
- [ ] **RF05 — Validar monitor:** permitir que o professor responsável valide/aprove monitores e sua relação com a matéria. O trecho transcrito como “pelo salário” é ambíguo; foi interpretado provisoriamente como validação pela matéria/disciplina.
- [ ] **RF06 — Informar disponibilidade:** permitir registrar/atualizar os dias e horários ocupados ou disponíveis do monitor, evitando oferecer horários indisponíveis.

### Restrições e requisitos de qualidade

- [ ] **Compatibilidade de interface — desktop e mobile:** a interface web deve permitir o uso das funcionalidades do sistema em navegadores de computadores e smartphones, adaptando o layout ao tamanho da tela sem perda de conteúdo ou de acesso às ações. A verificação deve cobrir os fluxos em ambos os formatos; definir as larguras de tela e os navegadores de referência.
- [ ] **Desempenho:** validar a meta inicial de até 50 requisições por segundo e esclarecer a estimativa de 3.000 usuários simultâneos; definir cenário e critério de teste.
- [ ] **Simplicidade:** favorecer implementação e manutenção por equipe pequena; evitar complexidade arquitetural não justificada.
- [ ] **Comunicação:** manter clara a comunicação entre frontend e backend via API REST.
- [ ] Descrever três requisitos arquiteturalmente significativos (ASRs) concretos e explicar como influenciam as decisões.
- [ ] Identificar requisitos pertinentes de segurança, disponibilidade, modificabilidade e testabilidade.

## ADR

Registrar pelo menos três decisões arquiteturais. Para cada ADR, documentar contexto, problema/forças, alternativas, decisão e consequências positivas e negativas.

- [ ] ADR 001 — Organização arquitetural (rascunho: monólito em camadas com MVC).
- [ ] ADR 002 — Persistência e acesso a dados.
- [ ] ADR 003 — A definir conforme as decisões arquiteturais efetivamente adotadas; sem pressupor integração externa.

## Tecnologias

- **Backend:** Java + Spring Boot (proposta inicial). - Maven - flaway para gerenciar banco dedados.
- **Frontend:** Vite + React + TypeScript + React Router; npm, ESM e Vitest.
- **Persistência/banco de dados:** a definir.
- **Testes e documentação da API:** a definir.
- **Ferramentas de diagramas:** a definir.

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
`BACKEND_PROXY_TARGET` em `frontend/.env.local`. Veja [frontend/README.md](frontend/README.md)
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

O frontend foi migrado de NestJS SSR para Vite + React + TypeScript. A escolha
prioriza a simplicidade para uma equipe pequena: o Spring permanece como único
backend e responsável pelas regras de negócio e persistência. Não há requisito
confirmado de SEO ou renderização no servidor que justifique outro servidor Node.

`app` define layout e rotas; `features/catalog` concentra telas e contratos do
catálogo; `shared/api` centraliza HTTP; `shared/useQuery` coordena carregamento,
erro e cancelamento. Views não acessam o banco. A separação favorece SRP, alta
coesão e baixo acoplamento sem criar serviços que apenas repassam chamadas.

Trade-off: o navegador precisa de JavaScript e a hospedagem deve encaminhar rotas
da SPA para `index.html`. Uma SPA não traz SSR/SEO por padrão. Next.js e manter
NestJS SSR foram descartados nesta migração por adicionarem conceitos e runtime
de servidor sem uma necessidade atual demonstrada.

## Porque não Arquitetura de Serviços?

A preencher: definir o que o grupo entende por “Arquitetura de Serviços”, comparar alternativas e justificar a decisão com base nos requisitos, complexidade, implantação e evolução.

## Porque não Microsserviços?

A preencher: comparar com a proposta de monólito, considerando tamanho da equipe, complexidade operacional, implantação, escalabilidade e necessidades reais de evolução.

## Comunicação

O navegador consulta a API REST Spring por HTTP/JSON. Em desenvolvimento, o proxy
do Vite mantém as chamadas na mesma origem. Em produção, publicar os arquivos
estáticos de `frontend/dist` e encaminhar `/api` ao Spring. O proxy do Vite não
faz parte do bundle. Contratos TypeScript ficam em `features/catalog/catalog.types.ts`.

## Trade Offs da arquitetura escolhida

A preencher: registrar benefícios, custos, riscos e limitações da arquitetura escolhida e relacioná-los aos ASRs. Considerar modificabilidade, desempenho, disponibilidade, testabilidade, complexidade, implantação, escalabilidade e custo.

## Abstração de componentes

A preencher: identificar os principais componentes/módulos, responsabilidades, interfaces e dependências; mostrar como a persistência e as integrações podem ser substituídas sem afetar partes não relacionadas.

## Diagramas

- [ ] Diagrama de classes.
- [ ] Diagrama de sequência.
- [ ] Diagrama de comunicação.
- [ ] Diagrama de componentes ou pacotes.

## Estado do protótipo

O frontend oferece consultas de cursos, matérias, vínculos e vagas, incluindo
detalhes de vaga. Carregamento, lista vazia, indisponibilidade e recurso não
encontrado são estados distintos. Os antigos formulários de escrita e telas sem
endpoint foram removidos: a API atual só implementa leitura de catálogo.

A fatia vertical exigida pela disciplina ainda precisa de comando com persistência,
consulta, erro relevante e dependência externa substituível. A migração do frontend
não implementa candidatura, seleção, autenticação ou CRUD no backend.

## Evolução

A preencher: analisar pelo menos duas mudanças possíveis e explicar quais partes seriam afetadas e quais permaneceriam estáveis.


## Escolhas
- Backend monolítico em camadas; frontend React por funcionalidade.
- API REST com contrato explícito entre frontend e backend; REST não elimina acoplamento.
- Banco de dados relacional ACID postgres
- Usar Swagger para mapear apis

documentação estará disponível em:
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`

- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

## Backend REST

O backend atual implementa catálogo em `catalog`, com controller, serviço,
repositórios JPA, entidades e DTOs. PostgreSQL é usado no perfil padrão e H2 no
perfil `dev`; migrations são gerenciadas pelo Flyway.

Endpoints implementados, todos de leitura:

- `GET /api/v1/courses` e `GET /api/v1/courses/{id}`;
- `GET /api/v1/subjects` e `GET /api/v1/subjects/{id}`;
- `GET /api/v1/course-subjects`, com filtro opcional `courseId`;
- `GET /api/v1/monitoring-vacancies` e `GET /api/v1/monitoring-vacancies/{id}`.

A existência de tabelas para usuários, candidaturas, monitores, horários e atividades
não representa endpoints implementados. Não há escrita disponível no controller atual.
