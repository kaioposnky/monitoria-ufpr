# Requisitos e Contexto

## 1. Contexto

Sistema feito para as disciplinas e coordenações do Setor de Ciências Exatas da UFPR. Ele publica vagas de monitoria, recebe candidaturas e formaliza os monitores aprovados, além de divulgar horários semanais de atendimento e registrar horas para validação docente.

## 2. Atores e sistemas externos

- Aluno: consulta cursos, disciplinas, matérias, vagas e horários; envia, edita e exclui suas candidaturas.
- Monitor (aluno com vínculo ativo de monitoria): faz o mesmo que um aluno e também cadastra, edita ou remove seus horários de atendimento e registros de atividade.
- Professor: cria, edita e remove suas próprias vagas; avalia candidaturas e efetiva monitores de suas vagas; acompanha e aprova as atividades de seus monitores.
- Administrador: gerencia cursos, disciplinas, matérias (cada matéria pertence a uma disciplina), vínculos entre cursos e disciplinas (N:N) e usuários; pode operar recursos de qualquer vaga ou monitor.
- Notificador (externo): recebe avisos ao registrar candidatura, avaliar candidatura, efetivar monitor e avaliar atividade.
- Agenda (externa): publica as datas de abertura e encerramento das vagas e os horários semanais de atendimento, com exportação em arquivo de calendário (.ics).

## 3. Requisitos

Os requisitos dividem-se em **requisitos funcionais** (RF01–RF08), **requisitos de qualidade** (RQ01–RQ07) e **requisitos de restrição** (RT01–RT03). Três deles são **Requisitos Arquiteturalmente Significativos (ASRs)**, porque determinaram decisões sobre a organização em camadas, o cache, a segurança e o isolamento das integrações externas.

### 3.1 Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF01 | Consultar cursos, disciplinas, matérias, vínculos e vagas, com filtro por texto, modalidade e status |
| RF02 | Consultar a grade semanal de atendimento e os eventos da agenda |
| RF03 | Cadastrar, editar, encerrar e cancelar vagas, com período de inscrição opcional |
| RF04 | Candidatar-se a uma vaga aberta, dentro do período de inscrição e uma única vez por vaga |
| RF05 | Avaliar candidaturas e efetivar monitores dentro do limite de vagas |
| RF06 | Gerenciar horários de atendimento semanais (segunda a sábado) |
| RF07 | Lançar e aprovar registros de atividades do monitor |
| RF08 | Autenticar usuários e administrar o catálogo acadêmico e as contas |

### 3.2 Requisitos de qualidade (incluindo ASRs)

| ID | Atributo de qualidade | Critério | ASR? |
| --- | --- | --- | --- |
| RQ01 | Desempenho | Depois da primeira carga, leituras repetidas de catálogo, vagas, monitores e horários devem ser respondidas da memória, sem nova consulta ao banco, e continuar corretas após alterações. | ASR-01 |
| RQ02 | Segurança | Requisições sem login válido devem ser recusadas (401), e requisições sem permissão sobre o recurso também (403). Quando um aluno vira monitor ou é desligado, a mudança vale na requisição seguinte, sem novo login e sem sessão no servidor. | ASR-02 |
| RQ03 | Modificabilidade e operabilidade | Trocar o provedor de notificação ou de agenda por configuração ou nova implementação, sem alterar as regras de negócio, e rodar o sistema completo localmente apenas com Java 21 e Node. | ASR-03 |
| RQ04 | Disponibilidade | Uma falha no envio de aviso ou na agenda não pode desfazer uma operação acadêmica já gravada: o erro é registrado e o sistema segue funcionando. | Não |
| RQ05 | Integridade de dados | Alterações rodam em transações, os dados recebidos são validados, os erros têm formato padronizado (400, 404, 409) e o banco garante as ligações e regras de unicidade. | Não |
| RQ06 | Usabilidade | As telas funcionam em computador e celular sem rolagem horizontal, validam o formato dos campos antes do envio e mostram os erros da API de forma uniforme. | Não |
| RQ07 | Testabilidade e interoperabilidade | Os testes rodam sem internet, com banco em memória e integrações simuladas; a API publica seu contrato (OpenAPI) e exporta a agenda no formato padrão de calendário (.ics). | Não |

### 3.3 Requisitos de restrição

| ID | Categoria | Restrição |
| --- | --- | --- |
| RT01 | Ambiente de execução | O sistema deve rodar em um único servidor da própria universidade, sem depender de nuvem pública ou serviços pagos, e também integralmente em uma máquina local para desenvolvimento e avaliação. |
| RT02 | Proteção de dados (LGPD) | Dados pessoais e acadêmicos devem ficar sob controle da universidade, com acesso restrito a quem tem permissão. |
| RT03 | Tecnologia do backend | Backend em Java 21 com Spring Boot, linguagem que a equipe conhece e que facilita a manutenção futura. |

### 3.4 Detalhamento dos ASRs

#### ASR-01: Leituras repetidas respondidas da memória

No início do semestre, as mesmas consultas de catálogo, vagas, monitores e horários se repetem muitas vezes. Depois da primeira consulta, as seguintes devem sair da memória, sem nova consulta ao banco; um teste automatizado confirma isso. Quando uma alteração termina com sucesso, os dados afetados são descartados da memória. Se a alteração falha, a memória continua como estava.

Influência arquitetural: esse requisito levou à adoção de um cache em memória dentro da própria aplicação, na estratégia cache-aside (o dado é buscado no banco na primeira vez e guardado para as próximas). Só os dados de consulta frequente usam cache. Como o sistema roda em um único servidor (RT01), não foi preciso um servidor de cache separado, como o Redis.

#### ASR-02: Login sem sessão e permissão conferida a cada requisição

Requisições sem login válido recebem 401, e requisições sem permissão sobre o recurso recebem 403. Ser monitor não é um tipo fixo de conta: um aluno vira monitor quando é efetivado e pode ser desligado no meio do semestre. Essa mudança precisa valer já na requisição seguinte, sem novo login e sem sessão guardada no servidor.

Influência arquitetural: esse requisito levou ao uso de uma API sem sessão, com token JWT que só identifica o usuário, e a uma verificação de acesso centralizada que consulta o banco a cada requisição para saber se ele é dono do recurso ou monitor ativo. Assim, a informação de monitor, que muda com o tempo, não fica presa no token, e a interface não consegue contornar as regras, porque tudo é conferido no backend.

#### ASR-03: Operação simples e troca de provedores sem mexer nas regras

Com equipe pequena e foco acadêmico, o sistema completo precisa subir localmente apenas com Java 21 e Node. Ao mesmo tempo, notificações e agenda precisam poder trocar de provedor por configuração ou nova implementação, sem alterar as regras de negócio.

Influência arquitetural: esse requisito levou ao monólito em camadas com uma SPA separada (descartando microsserviços e servidor de renderização), ao cache em memória em vez de Redis e ao isolamento das dependências externas atrás das interfaces Notificador e ServicoAgenda.

### 3.5 Detalhamento e motivação dos requisitos de restrição

#### RT01: Ambiente de execução

- **Restrição:** em produção, o sistema roda em um único servidor da universidade, sem nuvem pública nem serviços pagos. Em desenvolvimento e na avaliação, roda inteiro em uma máquina local.
- **Motivação:** o sistema atende apenas o Setor de Ciências Exatas, com pouco volume de uso, concentrado na abertura de vagas e no lançamento de horários. Para esse porte, uma única aplicação com o banco é suficiente. Esta é uma premissa do projeto: assumimos que a universidade oferece servidor próprio e que não há orçamento para serviços de nuvem pagos.
- **Efeito:** sem exigir servidores separados para cache, filas ou orquestração, a operação fica simples (ASR-03) e o cache pode ficar na memória da própria aplicação (ASR-01).

#### RT02: Proteção de dados

- **Restrição:** o sistema guarda dados pessoais e acadêmicos (nome, e-mail institucional, matrícula, senha protegida por hash, candidaturas e horas de monitoria), que devem ficar sob controle da universidade e só ser acessados por quem tem permissão.
- **Motivação:** a LGPD (Lei nº 13.709/2018) exige proteger dados pessoais e limitar o acesso ao necessário. Manter o banco no servidor da universidade e conferir a permissão em cada requisição (ASR-02) atende a isso. Isolar as integrações externas atrás de interfaces permite escolher provedores que respeitem essas regras antes de enviar qualquer dado para fora.

#### RT03: Tecnologia do backend

- **Restrição:** o backend deve ser feito em Java 21 com Spring Boot.
- **Motivação:** é a tecnologia que a equipe já domina, o que reduz o tempo de aprendizado e facilita que outras pessoas mantenham o sistema depois da entrega.
