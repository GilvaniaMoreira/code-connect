# Code Connect

Rede social para desenvolvedores compartilharem snippets de código, curtirem e comentarem posts. Monorepo pnpm com backend NestJS + Postgres e frontend React + Vite.

## Stack

- **API** ([apps/api/](apps/api/)) — NestJS 11, Prisma 6, PostgreSQL 16, JWT (Passport), Swagger, Jest.
- **Web** ([apps/web/](apps/web/)) — React 19, Vite 8, Tailwind CSS v4, Axios, Vitest + Testing Library, oxlint.
- **Infra** — Docker Compose para o Postgres, pnpm workspaces.

## Requisitos

- Node.js ≥ 20
- pnpm ≥ 9
- Docker Desktop (para o Postgres local)

## Setup

```powershell
# 1. instala dependências (raiz + workspaces)
pnpm install

# 2. cria o .env da raiz
Copy-Item .env.example .env

# 3. sobe o Postgres
pnpm db:up

# 4. aplica as migrations e popula com dados de exemplo
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma db seed
```

O seed cria 4 autores, alguns posts, curtidas e comentários. Login de exemplo — email `ana@codeconnect.dev`, senha `password123`.

## Comandos do dia a dia

Rodam da raiz do repo.

```powershell
# API + Web em paralelo
pnpm dev

# só um dos apps
pnpm api:dev            # http://localhost:3000 (Swagger em /docs)
pnpm web:dev            # http://localhost:5173

# build
pnpm build              # constrói ambos
pnpm api:build
pnpm web:build

# lint
pnpm lint               # ambos
pnpm api:lint           # eslint --fix
pnpm web:lint           # oxlint

# banco
pnpm db:up              # docker compose up -d postgres
pnpm db:down
pnpm db:logs
```

## Testes

### API — unit (Jest)

```powershell
pnpm --filter api exec jest
pnpm --filter api exec jest --watch
pnpm --filter api exec jest --coverage
pnpm --filter api exec jest posts.service.spec    # filtro por arquivo
```

### API — e2e (precisa do Postgres rodando)

```powershell
pnpm db:up
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec jest --config ./test/jest-e2e.json
```

### Web — Vitest

```powershell
pnpm --filter web test              # watch
pnpm --filter web exec vitest run   # single run
pnpm --filter web exec vitest --ui  # UI interativa
pnpm --filter web test:cov          # single run + cobertura (v8)
```

### Cobertura mesclada (API + Web)

Gera relatório único combinando Jest (api) e Vitest (web) via `nyc`:

```powershell
pnpm coverage
```

Saída em `coverage/`:

- `coverage/lcov.info` — pronto pra Codecov, Sonar, IDE plugins etc.
- `coverage/lcov-report/index.html` — relatório navegável.
- Text summary no stdout (statements, branches, functions, lines).

Passos individuais também disponíveis: `pnpm coverage:api`, `pnpm coverage:web`, `pnpm coverage:merge`.

## Estrutura

```text
code-connet/
├── apps/
│   ├── api/                          # NestJS 11
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # users, posts, likes, comments + tsvector
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── auth/                 # JWT + login (Passport)
│   │   │   ├── users/                # cadastro + /users/me
│   │   │   ├── posts/                # CRUD + likes + comments + full-text search
│   │   │   ├── prisma/               # PrismaService (lifecycle)
│   │   │   └── main.ts               # ValidationPipe, CORS, Swagger
│   │   └── test/                     # e2e specs
│   └── web/                          # React 19 + Vite
│       └── src/
│           ├── components/
│           │   ├── atoms/            # Button, Input, Avatar, ...
│           │   ├── molecules/        # FormField, SearchBox, ...
│           │   ├── organisms/        # PostCard, CommentSection, ...
│           │   ├── templates/        # AppLayout, AuthLayout
│           │   └── pages/            # LoginPage, FeedPage, PostDetailPage, ...
│           ├── services/             # api client (axios) — auth, posts
│           ├── lib/                  # token storage, session hook
│           └── index.css             # design tokens (@theme do Tailwind v4)
├── docker-compose.yml                # Postgres 16-alpine
├── pnpm-workspace.yaml
└── package.json                      # scripts agregadores
```

## Convenções

- **API RESTful** : URIs no plural (`/posts`, `/posts/:slug/likes`), verbos HTTP com significado (`GET`/`POST`/`PUT`/`PATCH`/`DELETE`), status codes precisos (`201`, `400`, `401`, `404`, `409`), DTOs + `ValidationPipe`. Erros via `HttpException`.
- **Web / Atomic Design**: atoms → molecules → organisms → templates → pages. Composição só pra cima.
- **Web / Tailwind com tokens semânticos** :  nada de hex cru (`bg-[#171d1f]`), nem paleta genérica (`text-white`, `bg-gray-800`). Use `bg-surface`, `text-foreground`, `bg-primary`, etc. Tokens ficam em [apps/web/src/index.css](apps/web/src/index.css) no bloco `@theme`.
- **Testes** :  todo componente ships com pelo menos um teste ao lado (`Button.tsx` + `Button.test.tsx`). Usa semântica do Testing Library (`getByRole`, `getByLabelText`), não detalhes de implementação.
- **Conventional Commits** : `<type>(<scope>)!: <resumo>`. Scope prefere workspace (`feat(web): ...`, `fix(api): ...`) ou funcional (`auth`, `posts`). Um commit por mudança lógica.

Detalhes completos em [CLAUDE.md](CLAUDE.md).

## Endpoints principais

Base: `http://localhost:3000` · Docs interativas em `/docs`.

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | `/users` | — | Cadastro |
| `POST` | `/auth/login` | — | Retorna JWT |
| `GET` | `/users/me` | Bearer | Perfil autenticado |
| `GET` | `/posts` | opcional | Lista com paginação e `?q=` (full-text) |
| `GET` | `/posts/:slug` | opcional | Detalhe (`likedByMe` reflete o viewer) |
| `POST` | `/posts` | Bearer | Cria post |
| `POST` | `/posts/:slug/likes` | Bearer | Curte |
| `DELETE` | `/posts/:slug/likes` | Bearer | Descurte (idempotente) |
| `POST` | `/posts/:slug/comments` | Bearer | Comenta |
| `GET` | `/thumbnails/:seed` | — | SVG placeholder determinístico |

## Deploy (Docker)

A stack de produção sobe API + Web + Postgres em contêineres. Cada app tem seu próprio Dockerfile multi-stage:

- [apps/api/Dockerfile](apps/api/Dockerfile) — `node:22-alpine`, build via `nest build`, runtime como usuário `node` (não-root).
- [apps/web/Dockerfile](apps/web/Dockerfile) — build Vite + servido por `nginxinc/nginx-unprivileged:alpine` na porta 8080.
- [apps/web/nginx.conf](apps/web/nginx.conf) — SPA fallback (`try_files ... /index.html`), cache imutável em `/assets/`, `no-cache` em `index.html`, headers de segurança.

### Subir a stack completa

```powershell
# 1. .env na raiz (usado pelo compose e pela API)
Copy-Item .env.example .env
# edite JWT_SECRET com um valor real (ex.: openssl rand -hex 32)

# 2. build + up
docker compose -f docker-compose.prod.yml up -d --build
```

Serviços expostos:

- `http://localhost:3000` — API (Swagger em `/docs`)
- `http://localhost:8080` — SPA
- `localhost:5432` — Postgres (só via containers, não é publicado por padrão)

A API roda `prisma migrate deploy` no start, então migrations pendentes são aplicadas automaticamente antes do servidor subir.

### Variáveis de ambiente

Além das do dev, o compose de produção lê:

| Var | Default | Descrição |
| --- | --- | --- |
| `API_PORT` | `3000` | Porta pública da API |
| `WEB_PORT` | `8080` | Porta pública do SPA |
| `VITE_API_URL` | `http://localhost:3000` | URL da API embutida no bundle do SPA (baked at build time) |
| `JWT_SECRET` | — | **Obrigatório.** API não sobe sem. |

`VITE_API_URL` é resolvida no `docker build` do web — se mudar, precisa rebuildar a imagem (`docker compose -f docker-compose.prod.yml build web`).

### Build de imagens individuais

```powershell
# API
docker build -f apps/api/Dockerfile -t code-connect-api .

# Web (com URL da API customizada)
docker build -f apps/web/Dockerfile --build-arg VITE_API_URL=https://api.example.com -t code-connect-web .
```

### Notas

- **Rede com proxy MITM** (comum em ambientes corporativos Windows): o `prisma generate` durante o `docker build` da API baixa o engine de `binaries.prisma.sh` e falha com `self-signed certificate in certificate chain`. Solução — buildar em rede sem inspeção SSL (CI, cloud) ou passar o CA corporativo via `NODE_EXTRA_CA_CERTS`.
- **Segurança**: ambos os containers rodam como usuários não-privilegiados; a API tem `helmet`, `ThrottlerGuard` global (120 req/min por IP) e limites mais apertados em `POST /auth/login` e `POST /users` (10/min).
