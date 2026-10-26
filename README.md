# Sistema de Monitoria

Projeto acadêmico de Design e Arquitetura de Software para propor uma solução de gerenciamento de monitorias acadêmicas. Este repositório será preenchido pelo grupo ao longo do trabalho; os itens abaixo são um rascunho inicial, não uma especificação final.

## Premissas iniciais — validar

- Aproximadamente 100 monitorias por semestre.
- Estimativa inicial de 30 alunos por monitoria: até 3.000 alunos potencialmente envolvidos no semestre.
- **Carga simultânea a esclarecer:** o cálculo acima não determina, por si só, 3.000 requisições simultâneas. Definir e justificar o cenário de carga antes de tratá-lo como requisito de desempenho.
- Arquitetura inicialmente considerada: monólito único, organizado em camadas, com MVC na apresentação.
- Backend inicialmente considerado: Java com Spring Boot.
- Frontend: a definir; será separado do backend.
- Interface visual: simples e alinhada à identidade visual da UFPR, sem priorizar sofisticação visual.

## Requisitos

> Rascunho para discussão. Transformar os itens confirmados em requisitos verificáveis e priorizados.

### Contexto e atores

- **Contexto:** gerenciamento de monitorias acadêmicas — detalhar o problema e o escopo.
- **Atores:** a definir (por exemplo, estudantes, monitores e docentes responsáveis; confirmar com o grupo).

### Requisitos funcionais

Definir entre 6 e 10 requisitos funcionais, com critérios de aceitação. Possíveis temas levantados na conversa, ainda a validar:

- [ ] Cadastro e consulta de monitorias.
- [ ] Inscrição ou candidatura de estudantes.
- [ ] Seleção e validação de monitores pelo responsável definido pelo grupo.
- [ ] Registro e consulta de horários/disponibilidade das monitorias.
- [ ] Acesso dos estudantes às informações ou atividades da monitoria.
- [ ] Prevenção de criação abusiva de contas — definir regra e abordagem.
- [ ] Outros: a definir.

### Restrições e requisitos de qualidade

- [ ] Confirmar tecnologias e restrições de implementação.
- [ ] Definir um cenário mensurável de desempenho e validar a estimativa de carga simultânea.
- [ ] Descrever três requisitos arquiteturalmente significativos (ASRs) e explicar como influenciam as decisões.
- [ ] Identificar requisitos de segurança, disponibilidade, modificabilidade e testabilidade pertinentes.

## ADR

Registrar pelo menos três decisões arquiteturais. Para cada ADR, documentar contexto, problema/forças, alternativas, decisão e consequências positivas e negativas.

- [ ] ADR 001 — Organização arquitetural (rascunho: monólito em camadas com MVC).
- [ ] ADR 002 — Persistência e acesso a dados.
- [ ] ADR 003 — Integração externa substituível (por exemplo, autenticação ou notificação; escolher após definir escopo).

## Tecnologias

- **Backend:** Java + Spring Boot (proposta inicial).
- **Frontend:** a definir.
- **Persistência/banco de dados:** a definir.
- **Testes e documentação da API:** a definir.
- **Ferramentas de diagramas:** a definir.

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
