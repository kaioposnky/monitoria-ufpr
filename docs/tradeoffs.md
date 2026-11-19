# Alternativas arquiteturais e trade-offs

## 1. Opções consideradas

### Alternativa A: Monólito simples acoplado (MVC tradicional)
Uma única aplicação que monta as páginas no servidor, com o código de cada tela acessando o banco diretamente, sem cache e sem separar as integrações de e-mail e agenda.

### Alternativa B (adotada): Monólito em camadas + SPA separada
Um único backend dividido em camadas (entrada HTTP, segurança, regras de negócio, acesso a dados e integrações), com cache em memória, interfaces Notificador e ServicoAgenda para os serviços externos e uma SPA em React que usa a API REST com login por token.

### Alternativa C: Microsserviços por domínio
Serviços independentes (catálogo, candidaturas e seleção, atividades, agenda e notificações), cada um com seu banco, mais um gateway de entrada, cache compartilhado e troca de mensagens entre os serviços.

## 2. Comparação

| Critério | Alternativa A (Monólito simples) | Alternativa B (Adotada) | Alternativa C (Microsserviços) |
| --- | --- | --- | --- |
| Modificabilidade | Baixa: regras de negócio, HTTP e chamadas externas ficam misturadas. | Boa para o porte do projeto: as regras ficam na camada de serviços, e as interfaces isolam notificação e agenda (ASR-03). | Alta para equipes separadas, mas cara para um grupo pequeno, porque cada mudança altera contratos de rede. |
| Leituras repetidas (ASR-01) | A proposta não inclui cache. | As leituras mais frequentes usam cache local; depois da primeira, não vão ao banco. | A proposta inclui chamadas de rede entre serviços. Sem medição, não há comparação de tempo de resposta. |
| Disponibilidade | Uma falha no processo ou em um serviço externo trava o fluxo. | Processo único; uma falha em notificação ou agenda é registrada no log sem desfazer a gravação no banco. | Isola quedas por serviço, mas exige acompanhar logs de vários serviços e coordená-los para não gerar dados inconsistentes. |
| Complexidade | Mínima no começo; piora conforme crescem os papéis e os fluxos. | Média: dois projetos entregues separadamente (backend e frontend), organizados por camada. | Alta: descoberta de serviços, autenticação distribuída, implantações coordenadas e dados sincronizados com atraso. |
| Implantação | Um único processo. | Uma aplicação backend mais os arquivos da SPA, servidos atrás do mesmo endereço. | Vários containers, bancos separados e um serviço de mensagens. |
| Escalabilidade | Apenas vertical. | Vertical de imediato; para rodar várias cópias, é preciso um cache compartilhado (como Redis) e guardar a agenda fora da memória. | Escala por serviço, mas o volume de um setor acadêmico não exige dividir a carga. |
| Custo (desenvolvimento e operação) | Barato no início, caro para evoluir. | Roda localmente só com Java 21 e Node (ASR-03). | Custo de infraestrutura e manutenção desproporcional ao tamanho da equipe. |

## 3. Ligação com os ASRs

| ASR | Como a Alternativa B atende |
| --- | --- |
| ASR-01 (Leituras em memória) | Usa cache na memória da própria aplicação e não vai ao banco em leituras repetidas, sem exigir um servidor de cache separado. |
| ASR-02 (Segurança sem sessão) | O login por token e a verificação de acesso ficam em um único backend, que confere as permissões antes de responder à SPA ou a outros clientes, sem precisar repetir isso em vários serviços. |
| ASR-03 (Simplicidade operacional) | Evita a infraestrutura da Alternativa C e o acoplamento da Alternativa A, separando as regras em camadas e as integrações atrás das interfaces Notificador e ServicoAgenda. |
