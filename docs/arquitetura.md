# Arquitetura

## 1. Organização

Cliente-servidor: uma SPA em React roda no navegador e conversa com o backend por uma API REST (HTTP/JSON). O backend é um monólito em camadas, e cada requisição percorre as camadas na ordem: segurança (confere o token e as permissões) → entrada HTTP → regras de negócio → acesso a dados.

Camadas do backend:

- Entrada HTTP: recebe as requisições da API, valida os dados enviados e repassa a operação para as regras de negócio.
- Segurança: identifica o usuário pelo token e confere se ele pode acessar o recurso pedido.
- Regras de negócio: concentra as regras, as transações e o cache, e chama as integrações externas.
- Acesso a dados: entidades que representam as tabelas e repositórios que leem e gravam no banco.
- Objetos de transferência: definem o formato dos dados que entram e saem da API.
- Integrações: notificações e agenda, atrás de interfaces.
- Erros e configuração: transformam erros de validação e de negócio em respostas HTTP padronizadas e reúnem as configurações da aplicação.

No frontend, as rotas ficam em um único ponto, as telas ficam separadas dos componentes reutilizáveis, e as regras de formulário e a comunicação com a API ficam em módulos próprios.

## 2. Modelagem

Ver [diagramas/classes.excalidraw](../diagramas/classes.excalidraw) e [MODELAGEM_BANCO.md](../MODELAGEM_BANCO.md).

| Classe / Grupo | Responsabilidade |
| --- | --- |
| Curso, Disciplina, CursoDisciplina, Materia | Catálogo de cursos e disciplinas em associação N:N e matérias vinculadas em 1:N a cada Disciplina|
| Usuario | Conta de acesso (ALUNO, PROFESSOR, ADMIN). Ser monitor não é um tipo de conta: é um vínculo ativo em Monitor. |
| VagaMonitoria | Oferta da vaga por disciplina/professor/semestre, tipo, capacidade, status e janela de dataAbertura e dataEncerramento|
| Candidatura | Inscrição única de um aluno em uma vaga, notas e status de avaliação|
| Monitor | Vínculo efetivado a partir da seleção, com carga horária, vigência e status (ATIVO, INATIVO, DESLIGADO, CONCLUIDO). |
| HorarioAtendimento | Dia da semana, horário inicial/final e local ou link. |
| RegistroAtividade | Lançamento de horas e descrição do monitor, além do status de aprovação e feedback docente. |
| AccessGuard | Avalia se o usuário autenticado é ADMIN, PROFESSOR dono da vaga, ALUNO dono da candidatura ou MONITOR com vínculo ATIVO. |

## 3. Princípios de design (GRASP, SOLID, coesão e acoplamento)
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

## 4. Comunicação e contrato REST

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

## 5. Decisões

Cada decisão está registrada em um ADR, com contexto, alternativas e consequências:

- [ADR-001](adr/ADR-001.md): monólito em camadas no backend.
- [ADR-002](adr/ADR-002.md): PostgreSQL com migrações versionadas; banco em memória (H2) só para desenvolvimento e testes.
- [ADR-003](adr/ADR-003.md): login com token JWT e verificação de acesso a cada requisição.
- [ADR-004](adr/ADR-004.md): notificações e agenda atrás de interfaces, com falha que não desfaz a gravação. Hoje nenhum provedor real está conectado: o envio de e-mail é registrado no log, e a agenda pode ser exportada em arquivo .ics.
- [ADR-005](adr/ADR-005.md): cache em memória para leituras repetidas.
- [ADR-006](adr/ADR-006.md): frontend (SPA) separado do backend.
- [ADR-007](adr/ADR-007.md): comunicação por API REST com contrato documentado.

## 6. Futura evolução

| Mudança | Como a arquitetura ajuda | O que ainda custa |
| --- | --- | --- |
| Enviar e-mails de verdade e usar uma agenda externa (por exemplo, Google Calendar) | As regras de negócio dependem só das interfaces de notificação e agenda. Basta criar uma nova implementação e trocar a configuração ([ADR-004](adr/ADR-004.md)). | Hoje uma falha só é registrada no log. Para garantir a entrega, seria preciso guardar os envios pendentes e tentar de novo. |
| Criar um aplicativo mobile | Todas as regras e permissões estão no backend e disponíveis pela API REST com token ([ADR-006](adr/ADR-006.md), [ADR-007](adr/ADR-007.md)). O aplicativo seria só mais um cliente. | Não há renovação de token: com 8 horas de validade, o usuário precisaria entrar de novo com frequência. |
| Atender mais setores, com várias cópias do backend | As camadas e a API não mudam. A troca do cache em memória por um cache compartilhado (como Redis) fica em um único lugar ([ADR-005](adr/ADR-005.md)). | Hoje o cache e a agenda ficam na memória de cada cópia. É preciso compartilhá-los e operar mais infraestrutura. |