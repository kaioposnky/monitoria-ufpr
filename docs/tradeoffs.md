# Alternativas arquiteturais e trade-offs

## 1. Opções consideradas

### Alternativa A: Monólito simples acoplado (MVC/SSR tradicional)
Aplicação única com geração de páginas no servidor ou controllers acessando repositórios JPA diretamente, sem cache explícito nem interfaces separadas para e-mail e agenda.

### Alternativa B (Adotada): Monólito em camadas (Spring Boot) + SPA React/Vite
Backend único separado por camadas técnicas (`controller`, `security`, `service`, `repository`, `entity`, `dto`, `integration`, `exception`, `config`), cache-aside via Spring Cache (`simple`), interfaces `Notificador` e `ServicoAgenda` para chamadas externas, e SPA consumindo `/api/v1/**` com JWT.

### Alternativa C: Microsserviços por domínio
Divisão em serviços independentes (Catálogo, Candidaturas/Seleção, Atividades e Agenda/Notificações) com bancos separados, API Gateway, Redis compartilhado e mensageria entre serviços.

## 2. Comparação

| Critério | Alternativa A (Monólito simples) | Alternativa B (Adotada) | Alternativa C (Microsserviços) |
| --- | --- | --- | --- |
| Modificabilidade | Baixa: regras de negócio, HTTP e chamadas externas ficam misturados. | Boa para o porte do projeto: services isolam regras e interfaces isolam `Notificador` e `ServicoAgenda` (ASR-03). | Alta para equipes separadas; cara para grupo pequeno porque cada mudança altera contratos de rede. |
| Desempenho | Toda consulta repetida bate no banco. | Cache-aside atende leituras repetidas de catálogo, vagas, monitores e horários em memória (ASR-01). | Adiciona latência de rede entre serviços e gateway. |
| Disponibilidade | Falha no processo ou dependência externa trava o fluxo. | Processo único no Spring; falhas em `Notificador` ou `ServicoAgenda` são logadas por `IntegracaoExecutor` sem desfazer a gravação no banco. | Isola quedas por serviço, mas exige correlação de logs e coordenação entre serviços para não gerar inconsistência. |
| Testabilidade | Difícil testar regra isolada sem banco/UI juntos. | Alta: integração com H2/MockMvc (`@ActiveProfiles("dev")` e `"test"`) e unitários mockando `Notificador` e `ServicoAgenda`. | Exige subir múltiplos containers ou montar contratos simulados entre serviços. |
| Complexidade | Mínima no começo; piora conforme crescem papéis e fluxos. | Média: dois artefatos de entrega (JAR Spring + bundle Vite) divididos por camada técnica. | Alta: service discovery, auth distribuída, deploys coordenados e consistência eventual. |
| Implantação | Um processo apenas. | Um JAR Spring Boot + estáticos `frontend/dist` atrás de proxy `/api`. | Múltiplos containers, bancos distintos e broker. |
| Escalabilidade | Apenas vertical. | Vertical imediata; escalar horizontalmente com réplicas exige trocar o cache `simple` por Redis e externalizar o mapa da agenda. | Escala por serviço, mas o volume de um setor acadêmico não exige particionamento de carga. |
| Custo (dev e operação) | Barato no início, caro para evoluir. | Roda local só com Java 21 e Node no perfil `dev` (ASR-03). | Custo de infra e manutenção desproporcional à equipe. |

## 3. Ligação com os ASRs

| ASR | Como a Alternativa B atende |
| --- | --- |
| ASR-01 (Leituras em memória) | Usa Spring Cache no processo Spring e não vai ao banco em leituras repetidas, sem exigir servidor Redis separado. |
| ASR-02 (Segurança stateless) | JWT + `AccessGuard` centralizam a checagem de permissões em um backend único antes de servir a SPA ou outros clientes, sem sincronizar chaves entre vários serviços. |
| ASR-03 (Simplicidade operacional) | Evita a infra da Alternativa C e evita o acoplamento direto da Alternativa A separando services e interfaces `Notificador` e `ServicoAgenda`. |
