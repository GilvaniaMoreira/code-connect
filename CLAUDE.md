# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspaces monorepo (`pnpm-workspace.yaml` → `apps/*`) with two independent applications:

- [apps/api/](apps/api/) — NestJS 11 REST backend (Express platform, Jest, ESLint + Prettier). Entry point [apps/api/src/main.ts](apps/api/src/main.ts) binds to `process.env.PORT ?? 3000`.
- [apps/web/](apps/web/) — React 19 + Vite 8 SPA linted with **oxlint** (not ESLint). Entry point [apps/web/src/main.tsx](apps/web/src/main.tsx), root component [apps/web/src/App.tsx](apps/web/src/App.tsx).

The two apps do not import from each other and have no shared package — treat them as independent projects that happen to share a lockfile.

## Commands

Run from the repo root. The root [package.json](package.json) exposes filter shortcuts so you rarely need to `cd` into `apps/*`.

**Run both apps in parallel (dev)**
```
pnpm dev
```
This uses `pnpm --parallel --filter web --filter api run "/^(dev|start:dev)$/"` — the regex is required because the web script is `dev` while the api script is `start:dev`.

**Per-app dev**
```
pnpm web:dev        # vite (web)
pnpm api:dev        # nest start --watch (api)
```

**Build / lint (all workspaces)**
```
pnpm build          # pnpm -r build
pnpm lint           # pnpm -r lint
```

**API-specific**
```
pnpm api:build              # nest build
pnpm api:start              # nest start (no watch)
pnpm api:test               # jest (unit, src/**/*.spec.ts)
pnpm api -- test:watch      # jest --watch
pnpm api -- test:cov        # jest --coverage
pnpm api -- test:e2e        # jest --config ./test/jest-e2e.json
pnpm api -- test -- <name>  # run a single test by name pattern
pnpm api:lint               # eslint --fix
```

**Web-specific**
```
pnpm web:build              # tsc -b && vite build
pnpm web:preview            # vite preview
pnpm web:lint               # oxlint
```

`pnpm web -- <script>` / `pnpm api -- <script>` forwards to any script in the sub-package.

## Tooling notes worth knowing before editing

- **Web uses oxlint, not ESLint** ([apps/web/.oxlintrc.json](apps/web/.oxlintrc.json)). Do not add ESLint config to the web app. Enabled plugins: `react`, `typescript`, `oxc`. Rules: `react/rules-of-hooks: error`, `react/only-export-components: warn`.
- **API uses ESLint 9 (flat config) + Prettier** ([apps/api/eslint.config.mjs](apps/api/eslint.config.mjs), [apps/api/.prettierrc](apps/api/.prettierrc)). `pnpm api:lint` runs with `--fix`.
- **Jest config lives in [apps/api/package.json](apps/api/package.json)** (`"jest"` key) with `rootDir: src` and `testRegex: .*\.spec\.ts$`. E2E config is separate at [apps/api/test/jest-e2e.json](apps/api/test/jest-e2e.json).
- **pnpm approves only specific native builds** ([pnpm-workspace.yaml](pnpm-workspace.yaml) `onlyBuiltDependencies`): `@nestjs/core`, `@swc/core`, `esbuild`, `unrs-resolver`. Adding a new dep with a postinstall/native build step may require adding it here.
- **NestJS 11 requires Node with ESM support**; API TypeScript config is CommonJS. Web is `"type": "module"` — do not mix.

## API architecture

Currently a fresh Nest starter — single [AppModule](apps/api/src/app.module.ts) wiring [AppController](apps/api/src/app.controller.ts) → [AppService](apps/api/src/app.service.ts). When adding features, follow the Nest module pattern (`nest g module|controller|service <name>` via `pnpm api -- exec nest g ...`) so the CLI wires imports into `AppModule` for you.

**REST conventions (mandatory).** The API must be RESTful — design every endpoint accordingly:

- **Resource-oriented URIs**: plural nouns, no verbs (`GET /users`, `POST /users`, `GET /users/:id/posts`). Never `/getUser` or `/createUser`.
- **HTTP verbs carry intent**: `GET` (read, safe, idempotent), `POST` (create), `PUT` (full replace, idempotent), `PATCH` (partial update), `DELETE` (idempotent). Don't tunnel writes through `GET`.
- **Correct status codes**: `200`/`201`/`204` for success, `400` validation, `401` auth, `403` forbidden, `404` missing, `409` conflict, `422` semantic, `5xx` server. Never return `200` with an `error` payload.
- **Stateless**: no server-side session state between requests; every request carries its own auth/context.
- **Consistent JSON payloads**, plural collection responses, and hypermedia-style relations where useful. Use DTOs + `ValidationPipe` (class-validator) for request validation.
- **Errors** follow Nest's `HttpException` hierarchy so responses stay uniform.

## Web architecture

Vite 8 + React 19 SPA. Root [vite.config.ts](apps/web/vite.config.ts) only registers `@vitejs/plugin-react`. TypeScript uses project references — [tsconfig.json](apps/web/tsconfig.json) delegates to [tsconfig.app.json](apps/web/tsconfig.app.json) (app sources) and [tsconfig.node.json](apps/web/tsconfig.node.json) (Vite config), so `tsc -b` builds both projects before Vite bundles.

**Atomic Design (mandatory).** Organize UI under `apps/web/src/components/` using the five tiers:

- `atoms/` — indivisible primitives (Button, Input, Label, Icon).
- `molecules/` — small groups of atoms working together (SearchField = Input + Button).
- `organisms/` — self-contained sections (Header, PostCard, CommentList).
- `templates/` — page layouts with slots but no real data.
- `pages/` — templates filled with real data / routing.

Compose upward only — an atom never imports a molecule, a molecule never imports an organism, etc.

**Styling: Tailwind CSS (mandatory).** All styling must go through Tailwind utility classes. Do not add per-component CSS files, CSS Modules, or CSS-in-JS. Extract repeated utility strings into components (or `@apply` in a single global stylesheet) rather than duplicating markup.

**Testing (mandatory).** Every component ships with at least one test covering its essential usage — the primary render path and the main user interaction (click, input, submit) if it has one. Colocate tests next to the component (`Button.tsx` + `Button.test.tsx`). Use React Testing Library semantics (`getByRole`, `getByLabelText`) — don't assert against implementation details.

## Git conventions

**Conventional Commits (mandatory) for the whole repo.** Every commit message follows:

```text
<type>(<optional-scope>)!: <short summary>

<optional body>

<optional footer(s)>
```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope** identifies the affected area — prefer the workspace name when the change is app-specific: `feat(web): ...`, `fix(api): ...`. Use a functional scope (`auth`, `posts`) for finer granularity. Omit scope only for cross-cutting changes.
- **Breaking changes**: append `!` after the type/scope **and** include a `BREAKING CHANGE:` footer explaining the migration.
- **Summary**: imperative mood, lowercase, no trailing period, ≤ 72 chars. English or Portuguese is fine — pick one and be consistent within a PR.
- One logical change per commit. Don't mix `feat` and `refactor` in the same commit.
