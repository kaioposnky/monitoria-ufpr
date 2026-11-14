# Requisitos e ASRs

## 1. Contexto

Sistema voltado às disciplinas e coordenações do Setor de Ciências Exatas da UFPR para publicar vagas de monitoria, receber candidaturas, formalizar monitores aprovados, divulgar horários semanais de atendimento e registrar horas executadas para validação docente.

## 2. Atores e sistemas externos

- Aluno (`ALUNO`): consulta cursos, matérias, vagas e horários; envia, edita e exclui suas candidaturas.
- Monitor (`ALUNO` com vínculo `ATIVO` na tabela `monitores`): mantém o que um aluno faz e também cadastra, edita ou remove seus horários de atendimento e registros de atividade.
- Professor (`PROFESSOR`): cria, edita e remove suas próprias vagas; lista candidaturas, avalia status (`PATCH /candidaturas/{id}/status`) e efetiva/gerencia monitores de suas vagas; cadastra/atualiza/remove registros e aprova atividades de seus monitores.
- Administrador (`ADMIN`): gerencia cursos, matérias, vínculos curso-matéria e usuários; possui permissão para operar recursos de qualquer vaga ou monitor.
- `Notificador` (externo): recebe notificações ao registrar candidatura, avaliar candidatura, efetivar monitor e avaliar atividade.
- `ServicoAgenda` (externo): publica datas de abertura/encerramento de vagas e horários semanais de atendimento, permitindo exportar `.ics`.

## 3. Requisitos funcionais

| ID | Requisito | Onde está no código |
| --- | --- | --- |
| RF01 | Consultar cursos, matérias, vínculos e vagas com filtro por texto, modalidade e status | `CursoController`, `MateriaController`, `CursoMateriaController`, `VagaMonitoriaController` (rotas `GET`) e `VacanciesPage` |
| RF02 | Consultar grade semanal de atendimento e eventos sincronizados na agenda | `GET /api/v1/horarios-atendimento/**`, `GET /api/v1/agenda/eventos`, `GET /api/v1/agenda/calendario.ics` e `OfficeHoursPage` |
| RF03 | Cadastrar, editar, encerrar/cancelar vagas com janela opcional de inscrição | `VagaMonitoriaController` + `VagaMonitoriaService` (valida `dataEncerramento >= dataAbertura`) e `VacancyForm` / `ManagementPage` |
| RF04 | Candidatar-se a uma vaga aberta | `CandidaturaController` + `CandidaturaService.criar` (exige vaga existente, status `ABERTA`, data atual dentro de `[dataAbertura, dataEncerramento]` e ausência de inscrição duplicada) |
| RF05 | Avaliar candidaturas e efetivar monitores dentro do limite da vaga | `PATCH /api/v1/candidaturas/{id}/status` + `MonitorService.criar` (checa `countByVagaIdAndStatus(..., ATIVO) < vaga.getQuantidadeVagas()`) |
| RF06 | Gerenciar horários de atendimento semanal (`SEGUNDA` a `SABADO`) | `HorarioAtendimentoController` + `HorarioAtendimentoService` (valida `horaFim > horaInicio` e sincroniza com `ServicoAgenda`) |
| RF07 | Lançar e aprovar registros de atividades do monitor | `RegistroAtividadeController` + `RegistroAtividadeService` (`horaFim > horaInicio` e `PATCH /{id}/aprovacao`) |
| RF08 | Autenticar usuários e administrar catálogo acadêmico e contas | `AuthController` (`/login`, `/me`) + `UsuarioController` e endpoints de escrita em catálogo restritos a `ADMIN` |

## 4. Restrições

1. O protótipo precisa rodar localmente em máquinas de desenvolvimento sem exigir instalação de PostgreSQL, servidor Redis ou SMTP (perfil `dev` em H2 + cache local + adaptadores em memória).
2. A base principal é relacional com schema controlado por scripts Flyway (`V1`–`V4`) e `ddl-auto=validate`, garantindo chaves estrangeiras, `CHECK`s e unicidades (`email`, `matricula`, `codigo`, `(vaga_id, aluno_id)`).
3. As telas devem funcionar em desktop e celular sem scroll horizontal nem perda de controles de formulário.
4. Toda checagem de papel, posse de vaga e regra de negócio precisa rodar no backend REST; o frontend só antecipa validações simples de formato.

## 5. Requisitos Arquiteturalmente Significativos (ASRs)

### ASR-01: Desempenho de leituras em memória para consultas repetidas

No início do período letivo, catálogo e grades acumulam leituras repetidas (`cursos`, `materias`, `cursos-materias`, `vagas-monitoria`, `horarios-atendimento` e também `monitores`, embora `/api/v1/monitores/**` exija autenticação). Depois da primeira consulta por chave, as leituras seguintes devem sair da memória sem nova query SQL (`0` chamadas aos repositórios em cache hit, verificado em `CacheAsideIntegrationTest`). Quando uma escrita (`POST`/`PUT`/`PATCH`/`DELETE`) termina sem erro, os caches afetados são limpos; falhas de validação ou regra de negócio mantêm o cache como estava. Na prática, isso definiu o uso de `@Cacheable`, `@CacheEvict` e `@Caching` do Spring Cache sobre DTOs `record` imutáveis, deixando sem cache apenas `candidaturas`, `usuarios` e `registros_atividades`.

### ASR-02: Autenticação stateless com autorização por vínculo e posse

Chamadas sem JWT válido retornam `401` (`NAO_AUTENTICADO`), e tokens sem permissão de papel ou sobre o recurso alvo recebem `403` (`ACESSO_NEGADO`). Quando um aluno vira `MONITOR` ativo (ou é desligado) em `monitores`, a permissão para cadastrar horários e atividades precisa valer já na requisição seguinte, sem exigir relogin nem sessão guardada no servidor. Para atender a isso, o `JwtAuthenticationFilter` valida o JWT (HMAC-SHA256) e cada endpoint protegido consulta o bean `AccessGuard` via `@PreAuthorize`, checando o vínculo `ATIVO` em `monitores` e a posse da vaga, candidatura, horário ou registro.

### ASR-03: Simplicidade operacional e troca localizada de provedores para equipe pequena

Com equipe pequena e foco acadêmico, o ambiente completo sobe local com Java 21 e Node (`./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` e `npm run dev`), usando H2 e cache em memória sem depender de PostgreSQL, Redis ou servidor SMTP. Ao mesmo tempo, notificações e agenda precisam trocar de implementação (`NotificadorFake`/`EmailNotificador` e `AgendaSimulada`/`AgendaIcsAdapter`) via propriedade `app.integracoes.*` ou novo adaptador, sem mexer em controllers, entidades ou services. Essa restrição guiou a adoção do monólito em camadas com SPA estática separada (sem microsserviços nem servidor SSR), Spring Cache `simple` no lugar de Redis e interfaces `Notificador` e `ServicoAgenda` chamadas via `IntegracaoExecutor`.
