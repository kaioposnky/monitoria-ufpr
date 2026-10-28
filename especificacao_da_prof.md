# especificação da prof
**2026-2**

---

## Objetivo

Cada grupo receberá um problema de software diferente. O objetivo do trabalho é projetar uma solução de software, justificando as decisões de design e arquitetura adotadas, e implementar uma pequena parte funcional que demonstre que a solução proposta pode ser concretizada.

O trabalho deverá responder, ao final, à seguinte questão:

> **Como este sistema deve ser organizado para atender aos requisitos atuais e permitir sua evolução sem gerar dependências desnecessárias?**

Não existe uma arquitetura obrigatória, qualquer uma que vimos na disciplina pode ser utilizada. A escolha deverá ser consequência dos requisitos, restrições, ASRs e trade-offs analisados pelo grupo.

---

## Entrega

Cada grupo deverá entregar o link de um repositório Git contendo:

* Documentação do projeto;
* Diagramas;
* Registros de decisões arquiteturais;
* Código-fonte;
* Testes;
* Protótipo executável.

O objetivo não é implementar o sistema completo. O foco é demonstrar coerência entre requisitos, decisões de design, arquitetura, modelos e código.

---

## 1. Descrição do Problema e Requisitos

O grupo deverá:

a) Apresentar brevemente o contexto do sistema;  
b) Identificar os principais atores;  
c) Definir entre 6 e 10 requisitos funcionais;  
d) Identificar restrições relevantes;  
e) Selecionar e descrever 3 requisitos arquiteturalmente significativos (ASRs);  
f) Justificar por que esses ASRs influenciam decisões arquiteturais.

> *Nota:* Os ASRs devem ser descritos de forma suficientemente concreta para orientar decisões. Sempre evite formulações vagas.

---

## 2. Modelo de Domínio e Responsabilidades

O grupo deverá identificar os principais conceitos do domínio e distribuir responsabilidades entre classes ou módulos.

A documentação deverá apresentar:

* Principais classes/conceitos do domínio;
* Responsabilidades de cada classe;
* Justificativas relacionadas a GRASP, quando necessário;
* Análise de coesão e acoplamento;
* Aplicação de princípios SOLID quando pertinente.

As decisões devem refletir responsabilidades reais do sistema.

---

## 3. Modelagem UML

O projeto deverá conter, no mínimo:

1. Diagrama de Classes;
2. Diagrama de Sequência;
3. Diagrama de Comunicação;
4. Diagrama de Componentes ou Pacotes.

Os modelos devem ser consistentes entre si. Por exemplo:
* Uma operação utilizada no Diagrama de Sequência deve fazer sentido em relação às responsabilidades mostradas no Diagrama de Classes;
* Os componentes/módulos devem ser compatíveis com a organização proposta;
* Dependências representadas nos diagramas devem ser coerentes com o código.

---

## 4. Proposta Arquitetural

O grupo deverá apresentar uma visão geral da arquitetura contendo:

* Principais componentes ou módulos;
* Responsabilidade de cada componente;
* Dependências entre eles;
* Interfaces relevantes;
* Mecanismos de comunicação;
* Persistência;
* Integrações externas;
* Decisões de comunicação;
* Documentação de API, quando necessário.

A organização arquitetural deverá ser explicitada. Exemplo:

```text
Cliente-servidor
       +
Monólito modular
       +
Organização em camadas
       +
MVC na apresentação
```

*Não basta citar o nome de uma arquitetura. É necessário mostrar como ela aparece na solução proposta.*

---

## 5. Alternativas e Trade-offs

O grupo deverá analisar pelo menos duas alternativas arquiteturais além da solução escolhida.

**Exemplo:**
* **Alternativa A:** Monólito simples
* **Alternativa B:** Monólito modular
* **Alternativa C:** Microsserviços

A comparação deverá considerar, quando pertinente:
* Modificabilidade;
* Desempenho;
* Disponibilidade;
* Testabilidade;
* Complexidade;
* Implantação;
* Escalabilidade;
* Custo de desenvolvimento e operação.

A decisão final deverá ser relacionada aos ASRs identificados anteriormente.

---

## 6. Architecture Decision Records (ADRs)

O projeto deverá conter pelo menos **3 ADRs**.

Cada ADR deverá registrar:

1. Contexto;
2. Problema ou forças envolvidas;
3. Alternativas consideradas;
4. Decisão;
5. Consequências positivas;
6. Consequências negativas, custos ou riscos.

**Exemplos de decisões adequadas para ADR:**
* Monólito modular ou microsserviços;
* Banco compartilhado ou separado;
* Comunicação síncrona ou assíncrona;
* Uso ou não de Arquitetura Hexagonal, Onion ou Clean Architecture;
* Estratégia para integração com serviços externos;
* Estratégia para persistência;
* Isolamento de notificações ou pagamentos.

---

## 7. Protótipo Funcional

Não é necessário implementar o sistema inteiro.

O grupo deverá implementar uma fatia vertical da solução contendo, no mínimo:

1. Um caso de uso que modifica o estado do sistema;
2. Uma consulta;
3. Um fluxo alternativo ou erro relevante;
4. Persistência dos dados;
5. Pelo menos uma dependência externa simulada ou real.

**Exemplo para um sistema de empréstimo de equipamentos:**

```text
solicitar empréstimo
        ↓
verificar disponibilidade
        ↓
  criar empréstimo
        ↓
     persistir
        ↓
enviar confirmação
```

Além disso, poderia existir:
* `consultar empréstimos`
* com um fluxo alternativo como: `equipamento indisponível`

O código implementado deverá ser coerente com os diagramas e com a arquitetura apresentada.

---

## 8. Dependência Externa

Todo projeto deverá conter pelo menos uma integração que possa ser substituída, mesmo que implementada inicialmente de forma simples.

**Exemplos:**

```text
Notificador
|-- EmailNotificador
`-- NotificadorFake
```

ou:
* `PagamentoGateway`

ou:
* `ServicoAutenticacao`

O objetivo é permitir a discussão sobre interfaces, dependências, testabilidade e modificabilidade.

---

## 9. Análise de Evolução

Ao final da documentação, o grupo deverá responder:

> **Se uma das principais tecnologias ou integrações utilizadas precisasse ser substituída, quais partes do sistema seriam afetadas?**

O grupo deverá selecionar pelo menos duas mudanças possíveis. Exemplos:
* PostgreSQL $\rightarrow$ outro mecanismo de persistência
* E-mail $\rightarrow$ WhatsApp
* Web $\rightarrow$ inclusão de aplicativo mobile

Para cada mudança, explicar:
* Quais elementos seriam afetados;
* Quais permaneceriam inalterados;
* Que decisões arquiteturais ajudariam ou dificultariam a mudança.

---

## 10. Estrutura Sugerida do Repositório

```text
projeto/
|-- README.md
|-- docs/
|   |-- requisitos.md
|   |-- arquitetura.md
|   |-- tradeoffs.md
|   `-- adr/
|       |-- ADR-001.md
|       |-- ADR-002.md
|       `-- ADR-003.md
|-- diagramas/
|   |-- classes.puml
|   |-- sequencia.puml
|   |-- comunicacao.puml
|   `-- componentes.puml
`-- src/
```

---

## 11. O que Não É Necessário

Não será avaliado pelo número de telas nem pela quantidade de funcionalidades.

Não é necessário desenvolver, salvo quando relevante para demonstrar uma decisão arquitetural:
* Login completo;
* CRUD de todas as entidades;
* Painel administrativo completo;
* Interface gráfica sofisticada;
* Implantação em nuvem;
* Microsserviços apenas para aumentar a complexidade do projeto.

O foco do trabalho é:

$$\text{requisitos} \rightarrow \text{responsabilidades} \rightarrow \text{design} \rightarrow \text{arquitetura} \rightarrow \text{código} \rightarrow \text{consequências das decisões}$$

---

## 12. Critérios de Avaliação

| Critério | Peso |
| :--- | :---: |
| Requisitos e identificação dos ASRs | 15% |
| Design | 15% |
| Modelagem UML e consistência entre modelos | 15% |
| Arquitetura proposta e organização das dependências | 20% |
| Justificativas, alternativas, trade-offs e ADRs | 15% |
| Protótipo e coerência entre arquitetura e código | 20% |
| **Total** | **100%** |

*A avaliação considerará se a complexidade introduzida é justificada pelos requisitos, restrições e ASRs do problema.*

---

## 13. Defesa

Na defesa, cada grupo deverá:
* Apresentar brevemente o problema;
* Destacar os principais ASRs;
* Explicar a arquitetura escolhida;
* Justificar pelo menos duas decisões arquiteturais;
* Demonstrar o protótipo;
* Responder perguntas sobre alternativas e trade-offs.

Durante a defesa poderá ser apresentada uma mudança de cenário, por exemplo:
* Inclusão de um aplicativo mobile;
* Substituição do serviço de e-mail;
* Aumento significativo de carga;
* Troca do mecanismo de persistência;
* Necessidade de separar uma funcionalidade para implantação independente.

O grupo deverá explicar como essa mudança afetaria a arquitetura proposta.

---

## Temas dos Projetos

9. **Monitorias acadêmicas:** Sistema para gerenciar vagas de monitoria, candidaturas, seleção de alunos, horários de atendimento e registro das atividades realizadas pelos monitores.