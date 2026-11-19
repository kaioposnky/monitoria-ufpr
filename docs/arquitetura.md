# Arquitetura

## Organização

Cliente-servidor (SPA React e API REST JSON/HTTP) + Monólito em camadas no backend (JwtAuthenticationFilter -> controller (+ AccessGuard) -> service -> repository/entity)


divisão do backend:
- controller: expõe /api/v1/**, valida entrada com @Valid e aplica @PreAuthorize 
- security: JwtService
- service: Concentra as lógicas de negócio. possúi transações (@Transactional), regras de negócio, anotações de cache e chamadas às portas externas.
- dto: records de dto.request e dto.response.
- entity e repository: entidades JPA que mapeiam o banco de dados e tem interfaces JpaRepository.
- integration: integrações com módulos externos...
- exception e config: traduz exceções de validação e negócio para HTTP e configurações

No frontend, app/App.tsx monta as rotas, pages/ guarda as telas, components/ agrupa os componentes reutilizaveis, features/ guarda contratos e validações.

## Modelagem

Ver [diagramas/classes.excalidraw](../diagramas/classes.excalidraw) e [MODELAGEM_BANCO.md](../MODELAGEM_BANCO.md).

| Classe / Grupo | Responsabilidade |
| --- | --- |
| Curso, Disciplina, CursoDisciplina, Materia | Catálogo de cursos e disciplinas em associação N:N e matérias vinculadas em 1:N a cada Disciplina|
| Usuario | Conta de acesso (ALUNO, MONITOR, PROFESSOR, ADMIN) |
| VagaMonitoria | Oferta da vaga por disciplina/professor/semestre, tipo, capacidade, status e janela de dataAbertura e dataEncerramento|
| Candidatura | Inscrição única de um aluno em uma vaga, notas e status de avaliação|
| Monitor | Vínculo efetivado a partir da seleção, com carga horária, vigência e status (ATIVO, INATIVO, DESLIGADO, CONCLUIDO). |
| HorarioAtendimento | Dia da semana, horário inicial/final e local ou link. |
| RegistroAtividade | Lançamento de horas e descrição do monitor, além do status de aprovação e feedback docente. |
| AccessGuard | Avalia se o usuário autenticado é ADMIN, PROFESSOR dono da vaga, ALUNO dono da candidatura ou MONITOR com vínculo ATIVO. |

# Utilização do GRASP, SOLID, coesão e acoplamento:
- Controller: Os controllers recebem as requisições HTTP e encaminham as operações para os serviços correspondentes, mantendo as regras de negócio e o acesso ao banco de dados fora dessa camada.

- Information Expert: As entidades são responsáveis por atualizar seus próprios atributos. Já as regras que envolvem diferentes entidades ficam nos serviços.

- Pure Fabrication: Algumas classes foram criadas para concentrar responsabilidades específicas, como autenticação, controle de acesso, tratamento de falhas externas e comunicação HTTP.

- Protected Variations e DIP: Os serviços dependem de interfaces, e não de implementações específicas. Isso permite substituir, por exemplo, o sistema de notificações falso pelo envio real de e-mails sem precisar modificar as regras de negócio.

- Baixo Acoplamento: Os relacionamentos entre as entidades utilizam identificadores em vez de referências diretas entre objetos. Essa escolha evita problemas com carregamento tardio, ciclos na serialização JSON e dependências entre entidades, embora exija que os serviços validem a existência dos registros relacionados.

- Information Expert e Creator: Os objetos responsáveis pelas respostas possuem métodos para montar os dados diretamente a partir das entidades. Já os serviços ficam responsáveis por criar os objetos do domínio, pois concentram as validações e dependências necessárias. No frontend, as validações e formatações relacionadas às vagas também ficam centralizadas em um único módulo.

- Indirection e Polymorphism: Existe uma camada intermediária entre os serviços e as integrações externas, responsável por tratar possíveis falhas sem espalhar tratamentos de exceção pelo sistema. Além disso, as interfaces permitem alternar entre diferentes implementações de notificações e agenda, com a escolha feita automaticamente pela configuração do Spring.

- Alta Coesão e Baixo Acoplamento: As classes e os módulos possuem responsabilidades bem definidas. Por exemplo, há componentes específicos para tratar erros HTTP, gerenciar tokens de autenticação e controlar o carregamento, os erros e o cancelamento de requisições. No frontend, os componentes recebem dados e eventos por propriedades, sem depender diretamente de chamadas HTTP.

- SRP (Responsabilidade Única): Cada classe fica responsável por uma parte específica do sistema. No fluxo de vagas, uma classe cuida das requisições, outra verifica as permissões, outra aplica as regras de negócio e outra padroniza os erros. No frontend, a autenticação também fica separada da comunicação HTTP.

- OCP (Aberto/Fechado): As integrações podem ser ampliadas sem precisar alterar os serviços existentes. Por exemplo, é possível adicionar notificações por WhatsApp ou integração com o Google Calendar criando novas implementações das interfaces. O mesmo princípio aparece na agenda, que possui uma classe base com comportamentos comuns e deixa algumas operações para suas subclasses.

- LSP (Substituição de Liskov): As diferentes implementações de notificações e agenda seguem os contratos definidos pelas interfaces e classes base. Assim, podem ser substituídas sem exigir mudanças nos serviços ou controladores que as utilizam.

- ISP (Segregação de Interfaces): As interfaces possuem apenas os métodos necessários para cada finalidade. Uma cuida das notificações, enquanto outra trata da agenda. A mesma preocupação aparece nos objetos de transferência de dados, que possuem estruturas diferentes para cadastro, atualização e alteração de status, evitando campos desnecessários.

- DIP (Inversão de Dependência): Além das interfaces de integração, o serviço de candidaturas recebe uma abstração de relógio para verificar os prazos de inscrição, em vez de depender diretamente do relógio do sistema operacional. Isso facilita os testes, permitindo simular datas específicas.

## 3. Comunicação e contrato REST

Ver [diagramas/componentes.excalidraw](../diagramas/componentes.excalidraw), [diagramas/sequencia.excalidraw](../diagramas/sequencia.excalidraw) e [diagramas/comunicacao.excalidraw](../diagramas/comunicacao.excalidraw).

A comunicação entre SPA e backend é síncrona por HTTP/JSON (exceto GET /api/v1/agenda/calendario.ics, que devolve text/calendar). A especificação OpenAPI fica em /v3/api-docs e /swagger-ui.html.

| Prefixo | Operações | Controle de acesso (detalhes em AccessGuard) |
| --- | --- | --- |
| /api/v1/auth | POST /login, GET /me | /login público; /me autenticado |
| /api/v1/cursos, /disciplinas | GET, POST, PUT, PATCH, DELETE | GET público; escrita restrita a ADMIN |
| /api/v1/materias | GET, GET /disciplina/{disciplinaId}, POST, PUT, PATCH, DELETE | GET público; escrita restrita a ADMIN |
| /api/v1/cursos-disciplinas | GET, POST /{cursoId}/{disciplinaId}, DELETE /{cursoId}/{disciplinaId} | GET público; escrita restrita a ADMIN |
| /api/v1/vagas-monitoria | GET, POST, PUT, PATCH, DELETE | GET público; escrita para PROFESSOR dono da vaga ou ADMIN |
| /api/v1/candidaturas | GET, GET /{id}, /vaga/{id}, /aluno/{id}, POST, PUT, PATCH, PATCH /{id}/status, DELETE | GET geral e /vaga/{id} para PROFESSOR/ADMIN; GET /{id} e /aluno/{id} para ALUNO dono, PROFESSOR ou ADMIN; POST/PUT/PATCH/DELETE para ALUNO dono ou ADMIN; PATCH /{id}/status para PROFESSOR dono da vaga ou ADMIN |
| /api/v1/monitores | GET, /vaga/{id}, /aluno/{id}, POST, PUT, PATCH, DELETE | GET autenticado; escrita para PROFESSOR dono da vaga ou ADMIN |
| /api/v1/horarios-atendimento | GET, /monitor/{id}, POST, PUT, PATCH, DELETE | GET público; escrita para MONITOR ativo dono, PROFESSOR dono da vaga ou ADMIN |
| /api/v1/registros-atividades | GET, /monitor/{id}, POST, PUT, PATCH, PATCH /{id}/aprovacao, DELETE | GET geral para PROFESSOR/ADMIN; leitura/escrita por registro para MONITOR ativo dono, PROFESSOR dono da vaga ou ADMIN; PATCH /{id}/aprovacao para PROFESSOR dono ou ADMIN |
| /api/v1/agenda | GET /eventos, GET /calendario.ics | Público |
| /api/v1/usuarios | GET, POST, PUT, PATCH, DELETE | GET lista para PROFESSOR/ADMIN; GET /{id} para próprio usuário ou PROFESSOR/ADMIN; escrita para ADMIN |

## 4. Decisões 

- Banco: PostgreSQL.. H2(está sendo utilizado só para testes. mas a decisão foi usar postgres).
- Cache em memória: Tem ADR sobre.
- Notificador: NotificadorFake (padrão quando app.integracoes.notificador=fake) guarda histórico em memória e loga; EmailNotificador (app.integracoes.notificador=email) valida o endereço e formata a mensagem com remetente configurável.
- ServicoAgenda: AgendaSimulada (padrão quando app.integracoes.agenda=simulada) mantém eventos de abertura/encerramento de vagas e horários semanais em mapa concorrente.
- Falha não bloqueante em integrações: IntegracaoExecutor.executarSemInterromper envolve as chamadas a Notificador e ServicoAgenda em try/catch. Se falhar, registra aviso no log e mantém a gravação já confirmada no banco.

## 5. Futura evolução
- 1: trocar NotificadorFake e AgendaSimulada por SMTP real e usar Google Calendar API
- 2: adicionar um aplicativo mobile nativo
- 3: sair de instância única para múltiplas réplicas com Redis (caso precisarmos de desempenho e/ou disponibilidade - fazer o sistema ser para mais setores)