# Cache Redis da API

## Arquitetura e escopo

A API usa **cache-aside** na camada `CatalogService`: uma leitura pública consulta
Redis, busca no PostgreSQL em caso de miss (ou falha do Redis) e preenche a
entrada depois. O PostgreSQL continua sendo a fonte de verdade. Nesta primeira
versão são cacheados somente cursos, matérias, vínculos curso--matéria e vagas
de monitoria. Candidaturas, monitores, horários e registros de atividade não
são cacheados.

Os valores são DTOs imutáveis serializados como JSON; entidades JPA nunca são
colocadas no Redis. O prefixo versionado é `monitoria:public:v1:`:

| Recurso | Chaves |
| --- | --- |
| Cursos | `courses:list`, `courses:detail:{id}` |
| Matérias | `subjects:list`, `subjects:detail:{id}` |
| Vínculos | `course-subjects:list`, `course-subjects:course:{id}`, `course-subjects:subject:{id}` |
| Vagas | `vacancies:list`, `vacancies:detail:{id}` |

As chaves completas incluem o prefixo acima. O TTL padrão é de 6 horas,
configurável; ele é uma proteção contra chaves órfãs, não o mecanismo primário
de consistência.

## Invalidação

Após qualquer alteração de curso, matéria ou vínculo, devem ser removidos os
detalhes, listas e relações afetadas. Alterações de vaga removem a lista e o
detalhe da vaga. A implementação centraliza essas operações em
`CatalogService.invalidateCourse`, `invalidateSubject`, `invalidateRelation`
e `invalidateVacancy`; novos endpoints de escrita devem chamá-las somente
depois da persistência confirmada.

## Configuração

Localmente, inicie Redis em `localhost:6379` ou defina:

```bash
SPRING_DATA_REDIS_URL=redis://localhost:6379
SPRING_DATA_REDIS_TIMEOUT=250ms
APP_CACHE_REDIS_ENABLED=true
APP_CACHE_REDIS_TTL=PT6H
```

Em produção, use `SPRING_DATA_REDIS_URL` com TLS/credenciais fornecidos pelo
ambiente e mantenha o cache habilitado. Para diagnóstico ou rollout gradual,
`APP_CACHE_REDIS_ENABLED=false` desliga o cache sem mudar o comportamento da
API.

## Falha e observabilidade

Erros de leitura, escrita e invalidação são capturados no adaptador Redis,
registrados em log e contabilizados nas métricas `app.cache.requests` (hit,
miss, fill e eviction) e `app.cache.failures` (read, write, evict e
serialize). Em falha, a requisição continua no PostgreSQL; uma falha de
invalidação não interrompe a escrita e o TTL limita a permanência de dados
antigos.

O Actuator expõe `health` e `metrics`. Não há fallback silencioso para valores
parcialmente desserializados: JSON inválido é tratado como falha e a fonte
primária é consultada.

## Testes e limitações

Os testes devem cobrir hit, miss, preenchimento, invalidação e indisponibilidade
do Redis usando `CacheService` com `StringRedisTemplate` simulado. A cobertura
de integração pode usar Redis efêmero/contêiner quando disponível. A primeira
entrega não oferece cache de candidaturas, monitores, horários ou atividades,
nem invalidação distribuída por eventos; alterações devem usar as operações de
invalidação do serviço antes de expandir o escopo.
