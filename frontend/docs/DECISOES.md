# Decisões do ciclo do frontend e pontos para análise

Este é o índice de decisões para o responsável pelo projeto e o grupo. Registra o ciclo de migração para React, reorganização das telas, formulários de rascunho e documentação. Recomendações abaixo **não são aprovações do grupo**. Nenhuma escolha de negócio pendente foi implementada como se estivesse confirmada.

- Regras, contratos e receitas de mudança: [CONTINUIDADE.md](CONTINUIDADE.md).
- Convenções técnicas: [../AGENTS.md](../AGENTS.md).
- Requisitos em discussão: [../../README.md](../../README.md).
- Exigências oficiais da entrega: [../../especificacao_da_prof.md](../../especificacao_da_prof.md).

## 1. Decisões já adotadas neste ciclo

| ID | Decisão e estado | Alternativas e justificativa | Consequências a considerar |
|---|---|---|---|
| D01 | **Adotada:** Vite + React + TypeScript + React Router; Spring como único backend de negócio | Manter NestJS SSR ou usar Next.js acrescentaria servidor/conceitos sem requisito confirmado de SSR/SEO | SPA depende de JavaScript; publicação precisa de fallback de rotas e encaminhamento da API |
| D02 | **Adotada por convenção solicitada:** página e componente em pasta própria; declaração `export function`; props exclusivas no TSX | Arquivo combinado e exports default/arrows foram substituídos para facilitar localização e manutenção | Mais arquivos; preservar imports diretos e evitar barrels |
| D03 | **Adotada:** separar composição de rotas, páginas, componentes, funcionalidades e transporte compartilhado | CRUD genérico misturava operações e contratos; camadas/classes extras não resolviam necessidade concreta | SRP, coesão e baixo acoplamento têm exemplos concretos; não afirmar aplicação integral de SOLID, GRASP ou Clean Architecture |
| D04 | **Adotada:** catálogo por endpoints reais; sem fallback fictício | Mock permanente esconderia indisponibilidade e quebra de contrato | Dados preenchidos dependem de backend acessível; erro e vazio são distintos |
| D05 | **Adotada como limite de implementação, não como entrega funcional completa:** quatro formulários preparam e revisam rascunhos sem gravação | Inventar POSTs ou apresentar sucesso falso foi rejeitado | Candidatura, vaga, decisão e disponibilidade ainda precisam de contrato e persistência; a fatia vertical não está concluída |
| D06 | **Adotada:** estado local e revisão editável, sem localStorage de dados pessoais | Persistência local criaria fonte paralela sem requisito | Edição preserva dados na mesma montagem; sair/recarregar perde o rascunho, com aviso explícito |
| D07 | **Adotada:** consultas canceláveis, nova tentativa manual e componentes compartilhados de erro/campo/revisão | Cache global, retries automáticos e bibliotecas de estado não foram necessários | Sem cache, polling ou timeout configurado; componentes comuns precisam de atenção aos consumidores |
| D08 | **Adotada:** README do frontend só descreve estrutura; AGENTS contém convenções; continuidade detalha comportamento | Concentrar tudo no README contrariaria a organização solicitada | Atualizar cada assunto no documento correto; este índice concentra o que analisar |

D01–D08 descrevem a implementação e as escolhas deste ciclo; não substituem os três ADRs formais exigidos pela professora. O histórico técnico e os campos atuais estão em CONTINUIDADE, seções 6 e 7.

## 2. Decisões pendentes — ordem recomendada

Para fechar cada item: registrar a opção escolhida, responsável/grupo, data, justificativa e critérios de aceitação. Até isso ocorrer, manter o estado **pendente**. A ausência do responsável durante esta publicação não autoriza aprovar regras acadêmicas em seu nome.

### P01 — Significado de candidatura e papéis

**Estado: pendente. Bloqueia o contrato de escrita de RF03 e a coerência dos modelos.**

- Opção A — candidatura de aluno para se tornar monitor.
- Opção B — inscrição de estudante para frequentar atendimento; exige outro fluxo/modelo, não apenas renomear candidatura.
- **Recomendação:** A. O tema oficial da professora menciona vagas, candidaturas e seleção de alunos; o README ainda mantém ambiguidade sobre participação.
- Definir estudante candidato, monitor aprovado e professor responsável; esclarecer se monitor é um papel global ou vínculo por disciplina/vaga/semestre.
- Aceitação da decisão: uma frase inequívoca para RF03 e exemplos de quem executa cada operação. Separar consulta/comparecimento ao atendimento da seleção de monitor.

### P02 — Escopo da fatia funcional da entrega

**Estado: pendente. Bloqueia priorização do backend e demonstração.**

- Opção A — candidatura: criar, consultar, rejeitar duplicidade/estado inválido e persistir.
- Opção B — disponibilidade: cadastrar, consultar e rejeitar conflito, vinculando monitor real.
- **Recomendação:** A após P01. O frontend já prepara candidatura e lê vagas abertas; permite demonstrar uma mudança de estado com erro de negócio claro.
- A escolha deve incluir uma dependência externa substituível (P07), não só CRUD.
- Aceitação: roteiro com escrita, consulta, erro relevante, persistência e integração externa simulada ou real. A professora não exige implementar todo o sistema.

### P03 — Identidade e autorização do protótipo

**Estado: pendente. IDs digitados não resolvem segurança.**

- Opção A — ator demonstrativo explícito, limitado ao ambiente de demonstração, com regras de permissão documentadas.
- Opção B — autenticação real e autorização por usuário/papel.
- **Recomendação:** A apenas se o grupo decidir que login não é necessário para demonstrar a fatia; B para uso real. Login completo não é exigência geral da professora.
- Definir quem cria vaga, candidata-se, decide candidatura e altera horário; impedir que a interface de gestão seja tratada como controle de acesso.
- Aceitação: origem verificável do ator em cada operação e comportamento de acesso negado; registrar limites do modo demonstrativo. Não confiar em `studentId`/`professorId` enviados livremente para uso real.

### P04 — Elegibilidade, dados e transições da candidatura

**Estado: pendente. As validações atuais de formulário são provisórias.**

- Definir se nota e CR são opcionais ou obrigatórios, suas escalas, precisão e fonte; manter 0–100 é uma opção de preenchimento atual, não regra acadêmica confirmada.
- Definir necessidade de aprovação na disciplina, matrícula ativa, prazos, justificativa e limites de texto.
- Definir se há desistência e recandidatura; o esquema atual tem unicidade aluno/vaga, o que exige escolha explícita se quiser permitir novo registro após desistência.
- Definir em quais estados de vaga se pode candidatar: somente `ABERTA` é a proposta atual da UI.
- **Recomendação:** começar com regras mínimas confirmadas, uma candidatura por aluno/vaga e validação autoritativa no Spring; não acrescentar ranking nem elegibilidade inferida.
- Aceitação: tabela de campos/obrigatoriedade e tabela de transições permitidas, com exemplos aceitos e rejeitados.

### P05 — Criação de vaga e aprovação/alocação de monitor

**Estado: pendente. Afeta RF04/RF05 e transações.**

- Definir quem cadastra, como o professor responsável é identificado, período de inscrição, quantidade de vagas e significado de remunerada/voluntária.
- Opção A — aprovar candidatura cria o vínculo de monitor na mesma transação.
- Opção B — aprovação e alocação são etapas separadas, com estados e responsáveis explícitos.
- **Recomendação:** A se não houver processo intermediário real; B somente se o grupo identificar essa necessidade.
- Definir limite de aprovados por vaga, concorrência, reaprovação/repetição de comando, encerramento/cancelamento e efeito sobre candidaturas existentes.
- Aceitação: demonstrar que a operação não aprova além da capacidade nem cria dois vínculos por repetição; registrar quando uma candidatura pode ser reprovada/alterada.

### P06 — Horários, disponibilidade e acesso ao atendimento

**Estado: pendente. Afeta RF02/RF06.**

- Opção A — disponibilidade recorrente semanal por monitor/vínculo.
- Opção B — atendimentos por data concreta, com exceções/cancelamentos.
- **Recomendação:** A para o protótipo se suficiente; não implementar calendário de exceções sem requisito.
- Confirmar dias permitidos (atualmente segunda a sábado), fuso, período de vigência, horário atravessando meia-noite, local físico/remoto e se link é obrigatório no remoto.
- Definir quais sobreposições são proibidas: mesmo monitor, sala ou ambos; distinguir disponibilidade declarada de atendimento efetivamente publicado.
- Confirmar se estudantes apenas consultam/comparecem ou se há reserva, capacidade e controle de presença. Os números de ocupação do README não comprovam essas funcionalidades.
- Aceitação: exemplos de intervalos válidos/conflitantes e contrato da consulta de horários; nada disso é garantido pelo formulário atual.

### P07 — Dependência externa substituível

**Estado: pendente. Obrigatória na entrega acadêmica; escolha ainda não aprovada.**

- Opção A — notificação de confirmação/decisão, com interface de aplicação e implementação simulada determinística no protótipo.
- Opção B — consulta de elegibilidade em serviço acadêmico, simulado se não houver API disponível.
- Opção C — autenticação externa, somente se P03 justificar esse escopo.
- **Recomendação:** A por escopo menor, caso notificação faça sentido no caso de uso aprovado. Não presumir envio real de e-mail, conta externa ou credenciais.
- Definir o que ocorre se a integração falhar: operação principal é mantida, fica pendente ou é rejeitada? Evitar prometer transação atômica entre banco e provedor externo.
- Aceitação: implementação substituível usada pelo caso de uso, alternativa de teste/demonstração e erro observável; documentar exatamente se é simulada ou real.

### P08 — Contratos de escrita e consulta posterior

**Estado: pendente de P01–P07 conforme a fatia. Trabalho técnico do implementador, não pergunta para o usuário sobre nomes de arquivos.**

- Definir DTOs, origem do ator, IDs e limites numéricos, nulos, datas, status de sucesso, erros de validação/conflito/acesso e recurso consultável após criação.
- Definir conversão das strings de rascunho; não enviar rascunho como DTO implicitamente.
- **Recomendação:** seguir os padrões do Spring existente e descrever o contrato na API antes de conectar a UI. Não inventar caminhos para fazê-la parecer integrada.
- Aceitação: escrita e consulta reais, erro mantendo os dados do formulário, bloqueio de duplo envio e confirmação somente após resposta real.

### P09 — ASRs e números de desempenho

**Estado: pendente de validação pelo grupo.**

- Confirmar se 100 monitorias/semestre, 30 alunos/sala, 3.000 participações e 50 requisições/s são estimativas, metas ou restrições; participações totais não equivalem a usuários simultâneos.
- Escolher três ASRs com estímulo, ambiente, resposta e medida. Candidatos para análise: modificabilidade da integração externa, integridade em candidaturas concorrentes e compatibilidade/acessibilidade desktop/mobile.
- **Recomendação:** selecionar métricas que possam ser demonstradas; não afirmar suporte a carga sem teste correspondente.
- Aceitação: três cenários mensuráveis ligados a decisões e evidência; metas numéricas aprovadas pelo grupo, não inventadas pelo agente.

### P10 — Desktop/mobile, identidade visual e publicação

**Estado: requisito de adaptação registrado; matriz de aceitação e destino ainda pendentes.**

- Definir navegadores e larguras de referência; 390 px mobile e 1365 px desktop são referências de inspeção anterior, não matriz aprovada.
- Confirmar critérios da identidade UFPR, uso de símbolos e conteúdo institucional. Interface sofisticada não é exigida.
- Opção A — demonstração local com Vite/proxy.
- Opção B — hospedagem estática com encaminhamento `/api`, fallback SPA e configuração pública da base da API.
- **Recomendação:** A para a disciplina salvo necessidade de compartilhar acesso; B requer destino definido. `vite preview` não tem o proxy de desenvolvimento.
- Aceitação: fluxos da fatia utilizáveis por teclado e em ambos os tamanhos, labels/foco/erros claros, sem perda de ações; se publicado, testar recarga em rota interna e API real.

### P11 — ADRs, alternativas, UML e evolução

**Estado: pendente como entrega acadêmica formal; este documento não substitui esses artefatos.**

- Selecionar pelo menos três ADRs com contexto, forças, alternativas, decisão e consequências positivas/negativas. Candidatos: organização cliente-servidor/monólito em camadas, persistência relacional e estratégia da dependência externa; a SPA também pode ser registrada.
- Comparar pelo menos duas alternativas além da escolhida, relacionando-as aos ASRs. A migração de framework frontend sozinha não satisfaz toda a comparação arquitetural do sistema.
- Produzir classes, sequência, comunicação e componentes/pacotes coerentes com a fatia realmente implementada.
- Selecionar duas mudanças para análise de evolução. Sugestões: substituir persistência e substituir o provedor externo; inclusão de app mobile é outra opção, não promessa de implementação.
- Aceitação: mesmos conceitos/operações nos diagramas e no código; para cada evolução, partes afetadas, estáveis e decisões que ajudam/dificultam.

## 3. Ordem para retomar

1. Grupo analisa P01, P02 e P03; depois as regras da fatia escolhida (P04/P05 ou P06).
2. Fecha P07 e P08; implementador resolve o ambiente Java e demonstra persistência real.
3. Grupo fecha P09/P10; implementador verifica os cenários aprovados.
4. Consolida P11 a partir da implementação, sem desenhar uma solução diferente da executável.

O impedimento observado no ambiente anterior foi ausência de compilador Java 21 utilizável para o Spring (`release version 21 not supported`), apesar do runtime Java 21. Resolver o JDK antes de nova verificação do backend; isso não é uma decisão acadêmica nem prova de falha da aplicação.

## 4. Limites da publicação deste ciclo

- A branch `frontend` reúne a migração já commitada e as alterações posteriores de organização, catálogo, rascunhos e documentação.
- Não se declara escrita integrada, autenticação, autorização, aprovação ou agenda persistida.
- `node_modules`, builds e caches não fazem parte das novas alterações publicadas. Dependências geradas já presentes no histórico não foram removidas por esta tarefa.
- Nenhuma recomendação pendente foi aprovada em nome do usuário. O objetivo deste arquivo é permitir análise posterior sem perder o contexto.
