# Dockerfile CloudCart Main (NestJS) — multi-stage
# Build context: raíz del monorepo (./) para resolver el workspace pnpm.

# ---------- Builder ----------
FROM node:24-alpine AS builder
WORKDIR /app

# pnpm 11 (fijado, compatible con pnpm-workspace.yaml)
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

# Manifests del workspace (todos: el lockfile los referencia)
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY services/main/package.json services/main/package.json
COPY apps/web/package.json apps/web/package.json

# Dependencias de @cloudcart/main (dev + prod, para compilar)
RUN pnpm install --frozen-lockfile --filter @cloudcart/main

# Código + config de compilación
COPY services/main/ ./services/main/

# Build (nest build -b swc → dist/)
RUN cd services/main && pnpm build

# Empaquetado prod autocontenido (package.json + node_modules plano)
RUN pnpm --filter @cloudcart/main deploy --prod --legacy /out

# ---------- Runner ----------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /out/ ./
COPY --from=builder /app/services/main/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
