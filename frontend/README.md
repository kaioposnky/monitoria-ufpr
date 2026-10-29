# Monitoria UFPR Exatas — frontend

Aplicação NestJS 12 server-rendered (HTML/CSS), sem SPA, que consome o backend Spring Boot pela API REST.

## Configuração

```bash
npm install
BACKEND_API_URL=http://localhost:8080/api/v1 npm run start:dev
```

O frontend escuta em `http://localhost:3000` por padrão. `PORT` altera a porta e
`FRONTEND_ORIGIN` documenta/ajusta a origem permitida pelo CORS do próprio frontend.
O backend deve liberar a origem usada pelo frontend (por exemplo,
`http://localhost:3000`; o CORS legado do backend mencionava `http://localhost:4200`).

## Mapa de telas

`/` painel inicial; `/courses`, `/subjects`, `/course-subjects`, `/users`,
`/monitoring-vacancies`, `/applications`, `/monitors`, `/office-hours` e
`/activity-records` oferecem listagem e formulário de criação para todos os
recursos do contrato `/api/v1`. Cada tela também oferece exclusão. As respostas
400, 404 e 409 do backend são mostradas com mensagens específicas.

O Swagger e o documento OpenAPI permanecem no backend em
`/swagger-ui.html` e `/v3/api-docs`.
