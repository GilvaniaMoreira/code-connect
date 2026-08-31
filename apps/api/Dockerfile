# syntax=docker/dockerfile:1.7
# Build context is the repo root — this Dockerfile understands the pnpm workspace layout.

FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
RUN corepack enable

WORKDIR /repo

# Manifests first so `pnpm install` can cache across source-only changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# --ignore-scripts skips the api's `prisma generate` postinstall (we run it
# explicitly below once the schema is copied over).
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps/api ./apps/api

RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# ---- Runner ----
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Root and workspace node_modules — pnpm hoists most deps to the root store.
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma
COPY --from=builder /repo/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api
EXPOSE 3000

# node:22-alpine ships a non-root `node` user (uid 1000) — drop root before running.
USER node
CMD ["node", "dist/main.js"]
