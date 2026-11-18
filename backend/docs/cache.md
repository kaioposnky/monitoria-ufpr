# Cache em memória da API (Spring Cache)

## Escopo

A API usa o cache nativo do Spring Boot (spring-boot-starter-cache com ConcurrentMapCacheManager, provedor simple) no padrão cache-aside direto nos services (@Cacheable, @CacheEvict, @Caching).

O banco relacional continua como base primária (PostgreSQL, ou H2 em dev/test). No cache miss, o método executa a query e guarda o DTO imutável em memória. Não há TTL configurado: a atualização do cache ocorre por invalidação explícita após escritas bem-sucedidas.

| Serviço | Caches |
| --- | --- |
| CursoService | cursos:list, cursos:detail |
| DisciplinaService | disciplinas:list, disciplinas:detail |
| MateriaService | materias:list, materias:detail, materias:by-disciplina |
| CursoDisciplinaService | curso-disciplinas:list |
| VagaMonitoriaService | vagas:list, vagas:detail |
| MonitorService | monitores:list, monitores:detail, monitores:by-vaga, monitores:by-aluno |
| HorarioAtendimentoService | horarios:list, horarios:detail, horarios:by-monitor |

Candidaturas, registros de atividade e usuários não usam cache.

## Invalidação

As anotações @CacheEvict e @Caching rodam após retorno sem exceção nos métodos criar, atualizar, excluir, vincular, desvincular e atualizarParcial (em VagaMonitoriaService). Quando o service lança RecursoNaoEncontradoException ou RegraNegocioException (ou quando @Valid rejeita o payload no controller ou ocorre DataIntegrityViolationException), a invalidação não acontece.

## Configuração e métricas

Habilitado por padrão em application.properties:

```properties
spring.cache.type=${SPRING_CACHE_TYPE:simple}
```

Para desabilitar sem alterar código, defina SPRING_CACHE_TYPE=none.

O Actuator expõe /actuator/health (público) e /actuator/metrics (autenticado via JWT, conforme SecurityConfig), com métricas nativas do Spring Cache quando ativo.
