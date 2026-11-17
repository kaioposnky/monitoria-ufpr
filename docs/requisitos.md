# Requisitos, Qualidade e ASRs

## 1. Contexto

Sistema feito para as disciplinas e coordenações do Setor de Ciências Exatas da UFPR. Ele publica vagas de monitoria, recebe candidaturas e formaliza os monitores aprovados, além de divulgar horários semanais de atendimento e registrar horas para validação docente.

## 2. Atores e sistemas externos

- Aluno (`ALUNO`): consulta cursos, disciplinas, matérias, vagas e horários; envia, edita e exclui suas candidaturas.
- Monitor (`ALUNO` com vínculo `ATIVO` na tabela `monitores`): mantém o que um aluno faz e também cadastra, edita ou remove seus horários de atendimento e registros de atividade.
- Professor (`PROFESSOR`): cria, edita e remove suas próprias vagas; lista candidaturas, avalia status (`PATCH /candidaturas/{id}/status`) e efetiva/gerencia monitores de suas vagas; cadastra/atualiza/remove registros e aprova atividades de seus monitores.
- Administrador (`ADMIN`): gerencia cursos, disciplinas, matérias (1:N com disciplinas), vínculos curso-disciplina (N:N) e usuários; tem permissão para operar recursos de qualquer vaga ou monitor.
- `Notificador` (externo): recebe notificações ao registrar candidatura, avaliar candidatura, efetivar monitor e avaliar atividade.
- `ServicoAgenda` (externo): publica datas de abertura/encerramento de vagas e horários semanais de atendimento, com exportação para `.ics`.

## 3. Requisitos

Os requisitos do sistema dividem-se em **requisitos funcionais** (`RF01`–`RF08`), **requisitos de qualidade** (`RQ01`–`RQ07`) e **requisitos de restrição** (`RT01`–`RT03`). Dentre esses direcionadores, três são classificados como **Requisitos Arquiteturalmente Significativos (ASRs)** por imporem decisões diretas sobre a organização em camadas, a estratégia de cache, o modelo de segurança e o isolamento de integrações externas.

### 3.1 Requisitos funcionais

| ID | Requisito | Onde está no código |
| --- | --- | --- |
| RF01 | Consultar cursos, disciplinas, matérias, vínculos e vagas com filtro por texto, modalidade e status | `CursoController`, `DisciplinaController`, `MateriaController`, `CursoDisciplinaController`, `VagaMonitoriaController` (rotas `GET`) e `VacanciesPage` |
| RF02 | Consultar grade semanal de atendimento e eventos sincronizados na agenda | `GET /api/v1/horarios-atendimento/**`, `GET /api/v1/agenda/eventos`, `GET /api/v1/agenda/calendario.ics` e `OfficeHoursPage` |
| RF03 | Cadastrar, editar, encerrar/cancelar vagas com janela opcional de inscrição | `VagaMonitoriaController` + `VagaMonitoriaService` (valida `dataEncerramento >= dataAbertura`) e `VacancyForm` / `ManagementPage` |
| RF04 | Candidatar-se a uma vaga aberta | `CandidaturaController` + `CandidaturaService.criar` (exige vaga existente, status `ABERTA`, data atual dentro de `[dataAbertura, dataEncerramento]` e ausência de inscrição duplicada) |
| RF05 | Avaliar candidaturas e efetivar monitores dentro do limite da vaga | `PATCH /api/v1/candidaturas/{id}/status` + `MonitorService.criar` (checa `countByVagaIdAndStatus(..., ATIVO) < vaga.getQuantidadeVagas()`) |
| RF06 | Gerenciar horários de atendimento semanal (`SEGUNDA` a `SABADO`) | `HorarioAtendimentoController` + `HorarioAtendimentoService` (valida `horaFim > horaInicio` e sincroniza com `ServicoAgenda`) |
| RF07 | Lançar e aprovar registros de atividades do monitor | `RegistroAtividadeController` + `RegistroAtividadeService` (`horaFim > horaInicio` e `PATCH /{id}/aprovacao`) |
| RF08 | Autenticar usuários e administrar catálogo acadêmico e contas | `AuthController` (`/login`, `/me`) + `UsuarioController` e endpoints de escrita em catálogo restritos a `ADMIN` |

### 3.2 Requisitos de qualidade (incluindo ASRs)

| ID | Atributo de qualidade | Critério / Descrição mensurável | ASR? | Onde está no código / verificação |
| --- | --- | --- | --- | --- |
| RQ01 | Desempenho | Leituras repetidas de catálogo, vagas, monitores e horários devem ser respondidas em memória sem nova query SQL após a primeira carga (`0` chamadas aos repositórios em *cache hit*), preservando consistência após escritas válidas. | **ASR-01** | `CacheConfig`, `@Cacheable`/`@CacheEvict`/`@Caching` nos services e `CacheAsideIntegrationTest` |
| RQ02 | Segurança | Endpoints protegidos devem rejeitar requisições sem JWT válido (`401 NAO_AUTENTICADO`) ou sem permissão/posse (`403 ACESSO_NEGADO`), refletindo imediatamente ativações ou desligamentos em `monitores` sem relogin e sem estado de sessão no servidor. | **ASR-02** | `SecurityConfig`, `JwtAuthenticationFilter`, `AccessGuard` e `AuthAndRbacIntegrationTest` |
| RQ03 | Modificabilidade e Operabilidade | Trocar provedores de notificação e agenda por configuração ou novo adaptador sem alterar controllers, services ou entidades, mantendo a execução local completa restrita a Java 21 e Node. | **ASR-03** | Interfaces `Notificador` e `ServicoAgenda`, `@ConditionalOnProperty` e perfil `dev` |
| RQ04 | Disponibilidade e Tolerância a falhas | Indisponibilidades ou exceções em `Notificador` e `ServicoAgenda` não podem reverter transações acadêmicas já confirmadas no banco (degradação graciosa com `log.warn`), mantendo healthcheck público ativo. | Não | `IntegracaoExecutor.executarSemInterromper`, `/actuator/health` e `ExternalIntegrationsTest` |
| RQ05 | Confiabilidade e Integridade de dados | Operações de escrita devem rodar em transações ACID (`@Transactional`), validar entrada com `@Valid`, devolver erros JSON padronizados (`400`, `404`, `409`) e respeitar FKs, `CHECK`s e unicidades do banco. | Não | `GlobalExceptionHandler`, entidades JPA e migrações Flyway `V1`–`V5` |
| RQ06 | Usabilidade e Responsividade | As telas da SPA devem operar em desktop e celular sem scroll horizontal nem perda de controles de formulário, oferecendo validação prévia de formato no cliente e exibição uniforme de mensagens de erro da API. | Não | `frontend/src/styles/global.css`, componentes de formulário e `frontend/src/shared/api/http.ts` |
| RQ07 | Testabilidade e Interoperabilidade | As suítes automatizadas devem executar offline com H2 e adaptadores simulados; a API deve expor contrato OpenAPI atualizado e exportação de calendário no padrão RFC-5545 (`.ics`). | Não | `OpenApiConfig` (`/v3/api-docs`, `/swagger-ui.html`), `AgendaIcsAdapter`, `MockMvc` e Vitest |

### 3.3 Requisitos de restrição

| ID | Categoria | Restrição / Critério | ASRs relacionados | Onde está no código / arquitetura |
| --- | --- | --- | --- | --- |
| RT01 | Ambiente de execução e infraestrutura (*on-premise*) | Todo *deploy* produtivo deve ocorrer *on-premise* na infraestrutura da UFPR (CCE ou TI do Setor de Ciências Exatas), em instância única sem nuvem pública; em desenvolvimento/avaliação, o sistema deve rodar localmente só com Java 21 e Node.js. | ASR-01, ASR-03 | `application.properties`, `application-dev.properties`, `CacheConfig`, `NotificadorFake`, `AgendaSimulada` e `package.json` (`start:all`) |
| RT02 | Conformidade legal e regulatória (LGPD e soberania de dados) | Dados pessoais e acadêmicos não podem sair de servidores em território nacional, permanecendo armazenados e processados sob custódia exclusiva da UFPR (Lei nº 13.709/2018). | ASR-02, ASR-03 | PostgreSQL *on-premise*, `db/migration/V1`–`V5`, BCrypt (`SecurityConfig`), `AccessGuard`, `EmailNotificador` e `AgendaIcsAdapter` |
| RT03 | Stack tecnológica obrigatória (Java 21 + Spring Boot) | Backend desenvolvido obrigatoriamente em **Java 21 com Spring Boot** (WebMVC, Security, Data JPA e Flyway sobre PostgreSQL), mantendo a interface desacoplada em React + TypeScript e concentrando regras e autorização no servidor REST. | ASR-02, ASR-03 | `backend/pom.xml`, pacote `com.sistema`, `OpenApiConfig` (`/api/v1/**`) e `frontend/` |

### 3.4 Detalhamento e justificativa arquitetural dos ASRs

#### ASR-01 (RQ01 / RT01): Desempenho de leituras em memória para consultas repetidas

No início do período letivo, catálogo e grades acumulam leituras repetidas (`cursos`, `disciplinas`, `materias`, `cursos-disciplinas`, `vagas-monitoria`, `horarios-atendimento` e também `monitores`, embora `/api/v1/monitores/**` exija autenticação). Depois da primeira consulta por chave, as leituras seguintes devem sair da memória sem nova query SQL (`0` chamadas aos repositórios em *cache hit*, verificado em `CacheAsideIntegrationTest`). Quando uma escrita (`POST`/`PUT`/`PATCH`/`DELETE`) termina sem erro, os caches afetados são limpos; falhas de validação ou regra de negócio mantêm o cache como estava.

**Influência arquitetural:** esse requisito determinou a adoção do padrão *cache-aside* via `@Cacheable`, `@CacheEvict` e `@Caching` do Spring Cache sobre DTOs `record` imutáveis (mantendo fora do cache apenas `candidaturas`, `usuarios` e `registros_atividades`), com provedor local em memória (`ConcurrentMapCacheManager` via `spring.cache.type=simple`) em vez de consultas diretas a cada requisição ou infraestrutura Redis obrigatória em servidor *on-premise* único (`RT01`).

#### ASR-02 (RQ02 / RT02 / RT03): Autenticação stateless com autorização por vínculo e posse

Chamadas sem JWT válido retornam `401` (`NAO_AUTENTICADO`), e tokens sem permissão de papel ou sobre o recurso alvo recebem `403` (`ACESSO_NEGADO`). Quando um aluno vira `MONITOR` ativo (ou é desligado) em `monitores`, a permissão para cadastrar horários e atividades precisa valer já na requisição seguinte, sem exigir relogin nem sessão guardada no servidor.

**Influência arquitetural:** esse requisito motivou o uso de API REST *stateless* com `JwtAuthenticationFilter` (HMAC-SHA256) combinada ao componente `AccessGuard` consultado via `@PreAuthorize` nos controllers do monólito Java/Spring (`RT03`). Como o vínculo `ATIVO` em `monitores` e a posse da vaga, candidatura, horário ou registro são avaliados por requisição contra o banco *on-premise* (`RT02`), evita-se colocar estado mutável de monitoria dentro do token JWT e impede-se qualquer bypass pela interface SPA.

#### ASR-03 (RQ03 / RT01 / RT02 / RT03): Simplicidade operacional e troca localizada de provedores para equipe pequena

Com equipe pequena e foco acadêmico, o ambiente completo sobe local com Java 21 e Node (`./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` e `npm run dev`), em H2 e cache em memória, sem depender de PostgreSQL, Redis ou servidor SMTP. Ao mesmo tempo, notificações e agenda precisam trocar de implementação (`NotificadorFake`/`EmailNotificador` e `AgendaSimulada`/`AgendaIcsAdapter`) via propriedade `app.integracoes.*` ou novo adaptador, sem mexer em controllers, entidades ou services.

**Influência arquitetural:** esse requisito guiou a escolha do monólito em camadas com SPA estática separada (descartando microsserviços e servidor SSR), o uso do Spring Cache `simple` em vez de Redis e o isolamento das dependências externas atrás das interfaces `Notificador` e `ServicoAgenda` (selecionadas por `@ConditionalOnProperty` e chamadas via `IntegracaoExecutor`), atendendo tanto ao ambiente enxuto *on-premise*/local (`RT01`) quanto à restrição de não enviar dados pessoais para provedores externos (`RT02`).

### 3.5 Detalhamento e motivação dos requisitos de restrição

#### RT01: Ambiente de execução e infraestrutura (*on-premise*)

- **Restrição:** Todo o *deploy* em ambiente produtivo deve ocorrer exclusivamente na infraestrutura *on-premise* da UFPR (servidores locais administrados pelo Centro de Computação Eletrônica — CCE ou pela infraestrutura de TI do Setor de Ciências Exatas), em instância única com recursos computacionais restritos e sem dependência de nuvem pública ou serviços gerenciados externos. No ambiente de desenvolvimento e avaliação acadêmica, o sistema também deve executar integralmente em máquina local apenas com Java 21 e Node.js (perfil `dev` com H2 em memória, cache local e adaptadores simulados).
- **Vínculo com o contexto do projeto:** O sistema atende exclusivamente às coordenações, docentes, alunos e monitores do Setor de Ciências Exatas da UFPR, com volume concentrado nos períodos de abertura de vagas e lançamento semanal de horários e atividades. Por rodar *on-premise* em servidor institucional único (um artefato JAR Spring Boot + estáticos da SPA React + PostgreSQL local), evita-se a exigência de servidores separados para Redis, *message brokers* ou orquestradores distribuídos, reforçando os requisitos `ASR-01` (cache em memória na JVM) e `ASR-03` (simplicidade operacional).
- **Motivação:** O Setor de Ciências Exatas não possui dotação orçamentária recorrente em moeda estrangeira para contratação contínua de provedores de nuvem comercial ou serviços PaaS/SaaS pagos, além de já contar com servidores próprios no Centro Politécnico e equipe reduzida de sustentação. Restringir a implantação ao parque *on-premise* da universidade reduz custos operacionais, elimina dependência de terceiros e garante autonomia à coordenação do setor.

#### RT02: Conformidade legal e regulatória (LGPD e soberania de dados)

- **Restrição:** Por força da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e das políticas institucionais de segurança da informação da UFPR, todos os dados pessoais e acadêmicos dos usuários não podem sair de servidores localizados em território nacional, devendo permanecer armazenados e processados sob custódia exclusiva da universidade.
- **Vínculo com o contexto do projeto:** O sistema manipula dados pessoais e acadêmicos de alunos, monitores, professores e administradores (`usuarios`, `candidaturas`, `monitores` e `registros_atividades`), incluindo nome, e-mail institucional, matrícula/GRR, credenciais protegidas por BCrypt e histórico de seleção e horas de monitoria. A retenção integral desses registros no PostgreSQL *on-premise* (com schema auditável via Flyway `V1`–`V5`), o controle estrito de papel e posse no `AccessGuard` (`ASR-02`) e o isolamento de `Notificador` e `ServicoAgenda` atrás de interfaces permitem usar apenas servidores institucionais (como SMTP interno da UFPR e exportação local `.ics` no `AgendaIcsAdapter`), sem enviar dados pessoais identificáveis para APIs ou nuvens estrangeiras.
- **Motivação:** Como instituição pública federal de ensino superior, a UFPR responde legalmente perante a ANPD, o Encarregado de Dados (DPO) institucional e órgãos de controle externo pela guarda de informações de estudantes e servidores. Impedir a saída de dados do território nacional e de servidores sob controle da universidade mitiga riscos jurídicos de transferência internacional irregular de dados, vazamentos em plataformas de terceiros e não conformidade em auditorias acadêmicas.

#### RT03: Stack tecnológica obrigatória (Java 21 + Spring Boot)

- **Restrição:** O backend deve ser obrigatoriamente desenvolvido em **Java 21 com Spring Boot** (utilizando Spring WebMVC, Spring Security, Spring Data JPA e Flyway sobre PostgreSQL, mantendo a interface web desacoplada em React + TypeScript).
- **Vínculo com o contexto do projeto:** Toda a regra de negócio do ciclo de monitorias (publicação de vagas, validação de janelas de inscrição, limite de vagas na efetivação de monitores, aprovação de registros de atividade, autenticação JWT e autorização contextual via `AccessGuard`) concentra-se no monólito em camadas `com.sistema` sobre Java 21 e Spring Boot 4.1.2, exposto via API REST `/api/v1/**` e documentado com OpenAPI.
- **Motivação:** A escolha é imposta tanto pela padronização tecnológica adotada pela equipe de TI da UFPR / laboratórios do Setor de Ciências Exatas — que já mantêm ambiente homologado para aplicações JVM e bancos PostgreSQL — quanto pela expertise prévia da equipe de desenvolvimento em Java e no ecossistema Spring. Isso reduz a curva de aprendizado durante o projeto e assegura que futuros bolsistas, monitores ou técnicos da universidade consigam manter, auditar e evoluir o sistema após a entrega sem depender de tecnologias exóticas ou sem suporte interno.


