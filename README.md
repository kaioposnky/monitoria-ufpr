# Sistema de Monitoria

Projeto acadêmico de Design e Arquitetura de Software para propor uma solução de gerenciamento de monitorias acadêmicas. Este repositório será preenchido pelo grupo ao longo do trabalho; os itens abaixo são um rascunho inicial, não uma especificação final.

## Escopo 
Exatas UFPR

## Premissas iniciais — propostas pelo grupo, ainda a validar

- Volume estimado: aproximadamente **100 monitorias por semestre**.
- Estimativa de ocupação: **30 alunos por monitoria/sala**, cerca de 3.000 participações no semestre. A transcrição também menciona “3.000 simultâneos”, mas isso precisa ser esclarecido: usuários simultâneos e requisições por segundo são métricas diferentes.
- Meta de desempenho mencionada: até **50 requisições por segundo**. Confirmar se é requisito, pico esperado ou apenas estimativa, e definir como será verificada.
- Arquitetura proposta: **um monólito**, organizado em camadas, com MVC na camada de apresentação e API REST.
- Backend proposto: **Java com Spring Boot**.
- Frontend separado do backend; tecnologia ainda não escolhida.
- A interface deve seguir a identidade visual/design da UFPR; o grupo não busca uma interface visual sofisticada. Detalhar os critérios visuais depois.
- A solução deve ser simples e rápida de implementar por uma equipe pequena, evitando complexidade sem justificativa.
- Considerar integração futura com serviços externos, inclusive autenticação institucional, se necessário. A fala indica integrar com um serviço existente em vez de construir autenticação completa; confirmar o escopo com o grupo.

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
- [ ] **RF07 — Controlar criação de contas:** incluir uma medida de segurança para reduzir criação abusiva ou múltiplas contas; definir regra e mecanismo sem assumir autenticação completa própria.
- [ ] **RF08 — Integrar autenticação externa:** prever integração com serviço de autenticação institucional/externo, caso confirmada como necessária; não presumir que o sistema implementará todo o provedor de autenticação.

### Restrições e requisitos de qualidade

- [ ] **Desempenho:** validar a meta inicial de até 50 requisições por segundo e esclarecer a estimativa de 3.000 usuários simultâneos; definir cenário e critério de teste.
- [ ] **Simplicidade:** favorecer implementação e manutenção por equipe pequena; evitar complexidade arquitetural não justificada.
- [ ] **Integração:** manter clara a comunicação via API REST e identificar a fronteira da integração externa de autenticação, se aprovada.
- [ ] Descrever três requisitos arquiteturalmente significativos (ASRs) concretos e explicar como influenciam as decisões.
- [ ] Identificar requisitos pertinentes de segurança, disponibilidade, modificabilidade e testabilidade.

## ADR

Registrar pelo menos três decisões arquiteturais. Para cada ADR, documentar contexto, problema/forças, alternativas, decisão e consequências positivas e negativas.

- [ ] ADR 001 — Organização arquitetural (rascunho: monólito em camadas com MVC).
- [ ] ADR 002 — Persistência e acesso a dados.
- [ ] ADR 003 — Integração externa substituível (por exemplo, autenticação ou notificação; escolher após definir escopo).

## Tecnologias

- **Backend:** Java + Spring Boot (proposta inicial). - Maven - flaway para gerenciar banco dedados.
- **Frontend:** NEST.js - npm - ESM - vitest
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

O backend Spring Boot fica disponível na porta `8080` e o frontend SSR NestJS
na porta `3000`. O frontend usa `http://localhost:8080/api/v1` por padrão;
altere `BACKEND_API_URL` se o backend estiver em outro endereço.

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

## Porque MVC?

A preencher: explicar como o MVC será aplicado no sistema, como se relaciona com a organização em camadas e quais responsabilidades ficam em cada parte. Justificar a escolha com base nos requisitos e ASRs, não apenas citar o padrão.

## Porque não Arquitetura de Serviços?

A preencher: definir o que o grupo entende por “Arquitetura de Serviços”, comparar alternativas e justificar a decisão com base nos requisitos, complexidade, implantação e evolução.

## Porque não Microsserviços?

A preencher: comparar com a proposta de monólito, considerando tamanho da equipe, complexidade operacional, implantação, escalabilidade e necessidades reais de evolução.

## Comunicação

A preencher: descrever a comunicação entre frontend e backend, interfaces/endpoints relevantes, protocolo, formato das mensagens e comunicação com integrações externas. Proposta inicial: API REST entre frontend e backend.

## Trade Offs da arquitetura escolhida

A preencher: registrar benefícios, custos, riscos e limitações da arquitetura escolhida e relacioná-los aos ASRs. Considerar modificabilidade, desempenho, disponibilidade, testabilidade, complexidade, implantação, escalabilidade e custo.

## Abstração de componentes

A preencher: identificar os principais componentes/módulos, responsabilidades, interfaces e dependências; mostrar como a persistência e as integrações podem ser substituídas sem afetar partes não relacionadas.

## Diagramas

- [ ] Diagrama de classes.
- [ ] Diagrama de sequência.
- [ ] Diagrama de comunicação.
- [ ] Diagrama de componentes ou pacotes.

## Protótipo — fase futura

Não implementar nesta etapa. Quando o grupo iniciar o protótipo, o trabalho pede uma fatia vertical demonstrativa que inclua um caso de uso que altera estado, uma consulta, um fluxo alternativo/erro, persistência e uma dependência externa real ou simulada.

## Evolução

A preencher: analisar pelo menos duas mudanças possíveis e explicar quais partes seriam afetadas e quais permaneceriam estáveis.


## Escolhas
- MVC
- Rest - ou seja, front e back desaclopados
- Banco de dados relacional ACID postgres
- Usar Swagger para mapear apis

documentação estará disponível em:
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`

- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

## Backend REST

monolito back: camadas `controller`, `service`, `repository`, `entity`, `dto` e `exception`. A API é stateless e usa PostgreSQL com
JPA/Flyway. O prefixo das rotas é `/api/v1`.

Os recursos persistidos possuem operações REST:

- `GET` consulta um recurso ou coleção;
- `POST` cria recursos;
- `PUT` substitui os dados editáveis de um recurso;
- `PATCH` altera parcialmente um recurso ou seu status;
- `DELETE` remove um recurso, respeitando as restrições de integridade do banco.

endpoints:

- `/api/v1/cursos`
- `/api/v1/materias`
- `/api/v1/cursos-materias`
- `/api/v1/usuarios`
- `/api/v1/vagas-monitoria`
- `/api/v1/candidaturas`
- `/api/v1/monitores`
- `/api/v1/horarios-atendimento`
- `/api/v1/registros-atividades`
