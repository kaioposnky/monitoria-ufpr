# Monitoria UFPR Exatas — frontend

SPA com Vite, React, TypeScript e React Router. O Spring Boot permanece como único backend de negócio. Não há servidor NestJS nem renderização no servidor neste frontend.

## Executar

Requer Node.js compatível com Vite 8 (20.19+ ou 22.12+; desenvolvimento verificado com Node 24).

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. Inicie também o backend Spring na porta 8080. Na raiz, `npm run start:all` inicia ambos com o perfil de desenvolvimento do backend; instale as dependências da raiz antes.

O navegador consulta `/api/v1`. O proxy de desenvolvimento encaminha `/api` para `http://localhost:8080`, evitando CORS entre as duas portas. Para alterar o destino, crie `frontend/.env.local`:

```dotenv
BACKEND_PROXY_TARGET=http://localhost:8081
```

Reinicie o Vite ao mudar a configuração. Essa variável só configura o servidor de desenvolvimento, não é enviada ao navegador.

## Build e publicação

```bash
npm run build
npm run preview
```

O build verifica TypeScript e gera arquivos estáticos em `dist/`. `preview` serve para conferir o bundle, não é servidor de produção nem substitui o proxy de desenvolvimento.

Em produção:

- Publique `dist/` em um servidor estático.
- Encaminhe `/api` ao Spring antes da regra de fallback da SPA.
- Encaminhe as rotas de navegação, como `/monitoring-vacancies/1`, para `index.html`.
- Por padrão, publique na raiz do domínio.

Se a API precisar de outra origem, configure `VITE_API_BASE_URL=https://api.exemplo.org/api/v1` antes do build e permita a origem do frontend no CORS do backend. Variáveis `VITE_*` ficam públicas no bundle: nunca coloque senhas, tokens privados ou segredos nelas.

## Telas disponíveis

- `/`: entrada do catálogo.
- `/courses`: cursos, códigos e setores.
- `/subjects`: matérias, códigos e departamentos.
- `/course-subjects`: vínculos com nomes de curso e matéria; a chave é composta.
- `/monitoring-vacancies`: vagas com matéria, semestre, modalidade e situação.
- `/monitoring-vacancies/:id`: detalhes, requisitos e descrição da vaga.
- Endereços desconhecidos exibem uma página de não encontrado na SPA (o servidor estático pode responder HTTP 200 pelo fallback).

Somente consultas reais da API atual são oferecidas. Não há formulários de criação, edição, exclusão, candidatura ou telas de entidades sem endpoint. Não há dados simulados nem fallback local de catálogo. Uma falha de rede não é apresentada como lista vazia.

## Organização e responsabilidades

- `src/app`: composição, rotas, navegação e layout.
- `src/features/catalog`: tipos alinhados aos DTOs Spring, consultas e telas de catálogo.
- `src/shared/api/http.ts`: HTTP e erros de resposta.
- `src/shared/useQuery.ts`: carregamento, erro, nova tentativa manual e cancelamento ao sair da tela.
- `src/shared/components`: apresentação dos estados de consulta.
- `src/styles`: CSS comum, responsividade e foco de teclado.

A organização é por funcionalidade e componentes, não MVC clássico. Separar HTTP da apresentação aplica SRP e reduz acoplamento. Não há Repository, contêiner de injeção ou camada de serviços que apenas repasse chamadas. Regras acadêmicas, autorização e persistência continuam no backend.

## Verificações

```bash
npm test
npm run lint
npm run build
```

Vitest cobre erros HTTP, resposta inválida, catálogo fora do contrato e cancelamento. Esses testes simulam o transporte e não comprovam integração com Spring ou persistência. Navegação e apresentação devem ser conferidas no navegador com o backend em execução.

## Migração

Substituído NestJS SSR por Vite + React + TypeScript. Removidos controllers, renderização por strings, metadados de CRUD, dependências e testes de servidor NestJS. O fluxo de escrita não foi migrado porque os endpoints correspondentes não existem no backend atual. A fatia vertical de candidatura exigida pela disciplina permanece uma implementação separada da migração tecnológica.
