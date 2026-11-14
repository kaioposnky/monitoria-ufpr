# Arquitetura e Design

## 1. Organização adotada

O sistema segue três escolhas estruturais visíveis nos diretórios:

```text
Cliente-servidor (SPA React <-> API REST JSON/HTTP)
       +
Monólito em camadas no backend (JwtAuthenticationFilter -> controller (+ AccessGuard) -> service -> repository/entity)
       +
Frontend por funcionalidade (app, pages, components, features, shared)
```

No backend (`backend/src/main/java/com/sistema`), a divisão segue camadas técnicas (não pacotes por domínio):

- `controller`: expõe `/api/v1/**`, valida entrada com `@Valid` e aplica `@PreAuthorize` (com exceção de `AuthController`, que lê `UsuarioRepository` e `MonitorRepository` direto, e `AgendaController`, que chama `ServicoAgenda`).
- `security`: `JwtService`, `JwtAuthenticationFilter` (carrega usuário de `UsuarioRepository`) e `AccessGuard` (consulta os repositórios para checar vínculo e posse).
- `service`: transações (`@Transactional`), regras de negócio, anotações de cache e chamadas às portas externas.
- `dto`: `dto.request` e `dto.response` (`record`s imutáveis de entrada e saída).
- `entity` e `repository`: entidades JPA e interfaces `JpaRepository`.
- `integration`: `IntegracaoExecutor` + subpacotes `notificacao` (`Notificador`, `NotificadorFake`, `EmailNotificador`, `NotificacaoMensagem`) e `agenda` (`ServicoAgenda`, `AbstractMapaAgenda`, `AgendaSimulada`, `AgendaIcsAdapter`, `AgendaSupport`, `AgendaStartupSynchronizer`, `EventoAgenda`).
- `exception` e `config`: `GlobalExceptionHandler` (traduz exceções de validação e negócio para HTTP `400`, `401`, `404`, `409`) e classes `@Configuration` (`SecurityConfig`, que registra os handlers JSON de `401` e `403`, além de `CacheConfig`, `CorsConfig`, `FlywayConfig`, `OpenApiConfig` e `TimeConfig`).

No frontend (`frontend/src`), `app/App.tsx` monta as rotas, `pages/` coordena chamadas e telas, `components/` agrupa os componentes visuais e formulários, `features/` (`auth`, `catalog`, `monitoring`) guarda contratos e validações locais, e `shared/` mantém `shared/api/http.ts` e `shared/useQuery.ts`.

## 2. Domínio, responsabilidades e princípios de design

Ver classes e relacionamentos em [diagramas/classes.puml](../diagramas/classes.puml) e tabelas em [MODELAGEM_BANCO.md](../MODELAGEM_BANCO.md).

| Classe / Grupo | Responsabilidade |
| --- | --- |
| `Curso`, `Materia`, `CursoMateria` | Catálogo de cursos, disciplinas e associação N:N via `CursoMateriaId`. |
| `Usuario` | Conta de acesso (`ALUNO`, `PROFESSOR`, `ADMIN`), `senhaHash` BCrypt e estado `ativo`. |
| `VagaMonitoria` | Oferta da vaga por matéria/professor/semestre, tipo, capacidade, status e janela opcional (`dataAbertura`, `dataEncerramento`). |
| `Candidatura` | Inscrição única de um aluno em uma vaga, notas opcionais e status de avaliação. |
| `Monitor` | Vínculo efetivado a partir da seleção, com carga horária, vigência e status (`ATIVO`, `INATIVO`, `DESLIGADO`, `CONCLUIDO`). |
| `HorarioAtendimento` | Dia da semana (`SEGUNDA` a `SABADO`), horário inicial/final e local ou link. |
| `RegistroAtividade` | Lançamento de horas e descrição do monitor, além do status de aprovação e feedback docente. |
| `AccessGuard` | Avalia se o usuário autenticado é `ADMIN`, `PROFESSOR` dono da vaga, `ALUNO` dono da candidatura ou `MONITOR` com vínculo `ATIVO`. |

Como GRASP, SOLID, coesão e acoplamento aparecem no código:

Cada `@RestController` de recurso recebe HTTP e delega ao service correspondente (padrão Controller), sem colocar SQL no controller. As entidades encapsulam a troca dos próprios campos (`VagaMonitoria.atualizar`, `RegistroAtividade.atualizarAprovacao`, `Usuario.atualizar`), enquanto regras que cruzam tabelas ficam nos services (ex.: `CandidaturaService.criar` consulta `VagaMonitoriaRepository` e `UsuarioRepository` antes de gravar).

Classes utilitárias e técnicas como `AccessGuard`, `JwtService`, `IntegracaoExecutor` e `shared/api/http.ts` funcionam como Pure Fabrication, mantendo segurança, tratamento de falha externa e transporte HTTP fora das entidades. Já `CandidaturaService`, `MonitorService`, `RegistroAtividadeService`, `VagaMonitoriaService` e `HorarioAtendimentoService` dependem das interfaces `Notificador` e `ServicoAgenda` (DIP e Protected Variations), permitindo trocar `NotificadorFake` por `EmailNotificador` sem editar services.

Os relacionamentos JPA entre entidades usam chaves `Long` (`vagaId`, `alunoId`, `materiaId`, `monitorId`) em vez de campos `@ManyToOne` navegáveis. Isso evita lazy loading fora de sessão (`spring.jpa.open-in-view=false`), ciclos no Jackson e acoplamento direto entre entidades; em troca, os services precisam validar manualmente a existência dos IDs relacionados antes de persistir.

## 3. Comunicação e contratos REST

Ver [diagramas/componentes.puml](../diagramas/componentes.puml), [diagramas/sequencia.puml](../diagramas/sequencia.puml) e [diagramas/comunicacao.puml](../diagramas/comunicacao.puml).

A comunicação entre SPA e backend é síncrona por HTTP/JSON (exceto `GET /api/v1/agenda/calendario.ics`, que devolve `text/calendar`). A especificação OpenAPI fica em `/v3/api-docs` e `/swagger-ui.html`.

| Prefixo | Operações | Controle de acesso (detalhes em `AccessGuard`) |
| --- | --- | --- |
| `/api/v1/auth` | `POST /login`, `GET /me` | `/login` público; `/me` autenticado |
| `/api/v1/cursos`, `/materias` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `GET` público; escrita restrita a `ADMIN` |
| `/api/v1/cursos-materias` | `GET`, `POST`, `DELETE` | `GET` público; escrita restrita a `ADMIN` |
| `/api/v1/vagas-monitoria` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `GET` público; escrita para `PROFESSOR` dono da vaga ou `ADMIN` |
| `/api/v1/candidaturas` | `GET`, `GET /{id}`, `/vaga/{id}`, `/aluno/{id}`, `POST`, `PUT`, `PATCH`, `PATCH /{id}/status`, `DELETE` | `GET` geral e `/vaga/{id}` para `PROFESSOR`/`ADMIN`; `GET /{id}` e `/aluno/{id}` para `ALUNO` dono, `PROFESSOR` ou `ADMIN`; `POST`/`PUT`/`PATCH`/`DELETE` para `ALUNO` dono ou `ADMIN`; `PATCH /{id}/status` para `PROFESSOR` dono da vaga ou `ADMIN` |
| `/api/v1/monitores` | `GET`, `/vaga/{id}`, `/aluno/{id}`, `POST`, `PUT`, `PATCH`, `DELETE` | `GET` autenticado; escrita para `PROFESSOR` dono da vaga ou `ADMIN` |
| `/api/v1/horarios-atendimento` | `GET`, `/monitor/{id}`, `POST`, `PUT`, `PATCH`, `DELETE` | `GET` público; escrita para `MONITOR` ativo dono, `PROFESSOR` dono da vaga ou `ADMIN` |
| `/api/v1/registros-atividades` | `GET`, `/monitor/{id}`, `POST`, `PUT`, `PATCH`, `PATCH /{id}/aprovacao`, `DELETE` | `GET` geral para `PROFESSOR`/`ADMIN`; leitura/escrita por registro para `MONITOR` ativo dono, `PROFESSOR` dono da vaga ou `ADMIN`; `PATCH /{id}/aprovacao` para `PROFESSOR` dono ou `ADMIN` |
| `/api/v1/agenda` | `GET /eventos`, `GET /calendario.ics` | Público |
| `/api/v1/usuarios` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `GET` lista para `PROFESSOR`/`ADMIN`; `GET /{id}` para próprio usuário ou `PROFESSOR`/`ADMIN`; escrita para `ADMIN` |

## 4. Persistência, cache e integrações externas

- Banco e migrações: PostgreSQL no perfil padrão e H2 nos perfis `dev` (Flyway ligado) e `test` (`ddl-auto=create-drop`). As migrações `V1` a `V4` criam tabelas, índices e constraints, incluindo `data_abertura` e `data_encerramento` na `V4`.
- Cache em memória: `CacheConfig` habilita `@EnableCaching` e o Spring Boot autoconfigura `ConcurrentMapCacheManager` (`spring.cache.type=simple`). Leituras de cursos, matérias, vínculos, vagas, monitores e horários ficam cacheadas até uma escrita acionar `@CacheEvict`/`@Caching`. Ver [backend/docs/cache.md](../backend/docs/cache.md).
- `Notificador` (`com.sistema.integration.notificacao`): `NotificadorFake` (padrão quando `app.integracoes.notificador=fake`) guarda histórico em memória e loga; `EmailNotificador` (`app.integracoes.notificador=email`) valida o endereço e formata a mensagem com remetente configurável.
- `ServicoAgenda` (`com.sistema.integration.agenda`): `AgendaSimulada` (padrão quando `app.integracoes.agenda=simulada`) mantém eventos de abertura/encerramento de vagas e horários semanais em mapa concorrente; `AgendaIcsAdapter` (`app.integracoes.agenda=ics`) atualiza um feed RFC-5545 (`VCALENDAR` / `RRULE:FREQ=WEEKLY`). Ambos reutilizam `AbstractMapaAgenda` e `AgendaSupport`.
- Falha não bloqueante em integrações: `IntegracaoExecutor.executarSemInterromper` envolve as chamadas a `Notificador` e `ServicoAgenda` em `try/catch`, registrando aviso em log sem desfazer a gravação já confirmada no banco.

## 5. Fatia vertical implementada no protótipo

O protótipo executa a fatia vertical prevista na disciplina:

1. Escrita com persistência: criação de vaga, submissão de candidatura, revisão de status, efetivação de monitor e cadastro de horário.
2. Consultas: listagem/detalhe de vagas, horários publicados e consulta de eventos sincronizados em `/api/v1/agenda/eventos`.
3. Erros e fluxos alternativos: tentativa em vaga inexistente (`404`), candidatura em vaga `EM_SELECAO`/`ENCERRADA` ou fora do período `dataAbertura`–`dataEncerramento` (`409`), candidatura duplicada (`409`), tentativa de efetivar monitor além de `quantidadeVagas` (`409`), `horaFim <= horaInicio` (`409`) e violação de RBAC (`403`).
4. Dependências externas: `Notificador` e `ServicoAgenda`, com testes automatizados cobrindo troca de bean por propriedade e falha simulada sem rollback.

## 6. Análise de evolução

### Mudança 1: trocar `NotificadorFake` e `AgendaSimulada` por SMTP real e Google Calendar API

Exigiria criar duas classes novas implementando `Notificador` e `ServicoAgenda` em `com.sistema.integration.*`, incluir dependências de cliente HTTP/mail no `pom.xml` e configurar credenciais externas via variáveis de ambiente. Controllers, `AccessGuard`, entidades JPA, repositórios, services de negócio (`CandidaturaService`, `VagaMonitoriaService`, `MonitorService`, `HorarioAtendimentoService`, `RegistroAtividadeService`) e o frontend React continuam intactos.

As interfaces isoladas e o `@ConditionalOnProperty` permitem ligar os adaptadores novos sem mexer nos fluxos atuais (ASR-03). O ponto que dificulta hoje é que `IntegracaoExecutor` apenas loga quando um serviço externo cai, sem fila de reenvio (*outbox*): se perder uma notificação ou evento de agenda for inaceitável, será preciso persistir eventos pendentes em tabela auxiliar.

### Mudança 2: adicionar um aplicativo mobile nativo

Requer desenvolver o cliente móvel consumindo a API REST existente e, caso o aplicativo precise manter usuários conectados por semanas, incluir endpoint de refresh token no `AuthController` (hoje `app.security.jwt.expiration-ms` expira em 8 horas sem renovação automática). Toda a lógica de negócio, RBAC contextual no `AccessGuard`, cache em memória, persistência e documentação OpenAPI seguem idênticos. A separação cliente-servidor e a autenticação stateless por JWT (ASR-02) favorecem esse cenário porque os endpoints já não dependem de sessão HTML nem cookies.

### Mudança 3: sair de instância única para múltiplas réplicas com Redis

Mudaria `CacheConfig` e `pom.xml` (troca do provedor `simple` por Redis) e exigiria substituir o armazenamento em memória de `AbstractMapaAgenda` (`AgendaSimulada` e `AgendaIcsAdapter`) por um banco ou serviço externo compartilhado, já que mapas locais na JVM não sincronizam entre réplicas. As anotações `@Cacheable`/`@CacheEvict` nos services, o modelo de dados e os endpoints continuam os mesmos.
