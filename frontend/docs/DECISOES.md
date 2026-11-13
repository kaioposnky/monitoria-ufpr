# Decisões do frontend

Resumo das escolhas técnicas locais da pasta `frontend/`. As decisões gerais do projeto estão em [docs/adr/](../../docs/adr) e [docs/tradeoffs.md](../../docs/tradeoffs.md).

| ID | Escolha | Motivo | Efeito no código |
| --- | --- | --- | --- |
| F01 | Vite + React + TypeScript + React Router em SPA | Deixa todas as regras de negócio só no Spring Boot e evita manter servidor Node SSR. | Precisa de JavaScript no navegador e fallback para `index.html` ao publicar estático. |
| F02 | Separação em `app/`, `pages/`, `components/`, `features/`, `shared/` | Mantém rotas, composição de página, UI e chamadas HTTP em arquivos previsíveis sem Redux. | Imports diretos por arquivo, sem `index.ts` de reexportação. |
| F03 | Componentes em pasta própria com `export function` | Facilita localizar arquivo, props e CSS/teste associados. | Evita `export default` e arquivos separados só de props. |
| F04 | Cliente HTTP único em `shared/api/http.ts` | Concentra `Authorization: Bearer`, `AbortSignal` e leitura dos erros JSON do backend. | Nenhuma página ou componente chama `fetch` direto. |
| F05 | Hook local `useQuery` sem cache global | As telas recarregam listas pequenas após escrita via `query.retry()`. | Não existe cache nem retry automático no cliente. |
| F06 | Exibição de `dataAbertura`/`dataEncerramento` e seção de agenda em `/office-hours` | Mostra prazos nas vagas e permite consultar eventos e baixar `.ics`. | Depende de `GET /api/v1/agenda/eventos` e `GET /api/v1/agenda/calendario.ics` no backend. |
