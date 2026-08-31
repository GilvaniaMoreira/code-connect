# syntax=docker/dockerfile:1.7
# Build context is the repo root.

FROM node:22-alpine AS builder
RUN corepack enable

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Skip postinstall scripts (api's `prisma generate` would fail without the
# schema, and the web image doesn't need it).
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps/web ./apps/web

# API URL must be baked in at build time — Vite inlines VITE_* vars.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter web build

# ---- Runner (nginx serves the SPA) ----
# `nginx-unprivileged` runs as the non-root `nginx` user and listens on 8080.
FROM nginxinc/nginx-unprivileged:alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 8080
